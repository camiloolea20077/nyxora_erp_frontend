import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../shared/models/catalogo.model';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { ReciboCajaService } from '../services/recibo-caja.service';
import { CreateReciboCajaLineaDto, CreateReciboCajaPagoDto } from '../models/recibo-caja.model';
import { CajaService } from '../../caja/services/caja.service';
import { CajaTableModel } from '../../caja/models/caja.model';
import { CuentaCobrarService } from '../../../cartera/cuenta-cobrar/services/cuenta-cobrar.service';
import { CuentaService } from '../../../contabilidad/cuenta/services/cuenta.service';
import { CuentaTableModel } from '../../../contabilidad/cuenta/models/cuenta.model';
import { PeriodoService } from '../../../contabilidad/periodo/services/periodo.service';
import { PeriodoTableModel } from '../../../contabilidad/periodo/models/periodo.model';
import { nombreMes } from '../../../contabilidad/periodo/meses';

interface PagoUI {
  _id: number;
  formaPagoId: number | null;
  valor: number | null;
}
interface AplicacionUI {
  _id: number;
  cuentaPorCobrarId: number | null;
  valorAplicado: number | null;
}
interface CxcOpt {
  id: number;
  label: string;
  saldo: number;
}

@Component({
  selector: 'app-form-recibo-caja',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, DecimalPipe, ButtonModule, InputTextModule, InputNumberModule, SelectModule, TerceroSelectorComponent],
  templateUrl: './form-recibo-caja.component.html',
  styleUrl: './form-recibo-caja.component.css',
})
export class FormReciboCajaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReciboCajaService);
  private readonly cajaService = inject(CajaService);
  private readonly cxcService = inject(CuentaCobrarService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly periodoService = inject(PeriodoService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly cajas = signal<CajaTableModel[]>([]);
  readonly formasPago = signal<CatalogoItem[]>([]);
  readonly cuentasCobrar = signal<CxcOpt[]>([]);
  readonly cuentas = signal<CuentaTableModel[]>([]);
  readonly periodos = signal<PeriodoTableModel[]>([]);
  readonly periodoOpts = computed(() =>
    this.periodos().map((p) => ({ id: p.id, label: `${p.anio} · ${nombreMes(p.mes)}` })),
  );

  readonly showSelector = signal(false);
  readonly clienteNombre = signal<string | null>(null);

  private seq = 0;
  readonly pagos = signal<PagoUI[]>([]);
  readonly aplicaciones = signal<AplicacionUI[]>([]);
  readonly totalPagos = computed(() => this.pagos().reduce((a, p) => a + (p.valor ?? 0), 0));
  readonly totalAplicado = computed(() => this.aplicaciones().reduce((a, l) => a + (l.valorAplicado ?? 0), 0));

  readonly frm = this.fb.group({
    cajaId: this.fb.control<number | null>(null, [Validators.required]),
    clienteId: this.fb.control<number | null>(null),
    numero: this.fb.control<string | null>(null),
    fecha: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [Validators.required]),
    observaciones: this.fb.control<string | null>(null),
    cuentaCajaId: this.fb.control<number | null>(null),
    cuentaCxcId: this.fb.control<number | null>(null),
    periodoContableId: this.fb.control<number | null>(null),
  });

  constructor() {
    void this.cargarCatalogos();
    this.agregarPago();
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [caj, fp, cxc, cue, per] = await Promise.all([
        lastValueFrom(this.cajaService.list(req)),
        lastValueFrom(this.catalogoService.list('forma-pago', req)),
        lastValueFrom(this.cxcService.list(req)),
        lastValueFrom(this.cuentaService.list(req)),
        lastValueFrom(this.periodoService.list({ page: 0, rows: 500 })),
      ]);
      this.cajas.set(caj.data.content.filter((c) => c.estado === 'abierta'));
      this.formasPago.set(fp.data.content);
      this.cuentasCobrar.set(
        cxc.data.content
          .filter((c) => (c.saldo ?? 0) > 0 && c.estado !== 'anulada' && c.estado !== 'pagada')
          .map((c) => ({ id: c.id, saldo: c.saldo ?? 0, label: `#${c.id} · saldo ${formatNum(c.saldo)}` })),
      );
      this.cuentas.set(cue.data.content);
      this.periodos.set(per.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  saldoCxc(id: number | null): number {
    return this.cuentasCobrar().find((c) => c.id === id)?.saldo ?? 0;
  }

  openSelector(): void {
    this.showSelector.set(true);
  }
  onClienteSelected(t: TerceroTableModel): void {
    this.frm.controls.clienteId.setValue(t.id);
    this.clienteNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }

  agregarPago(): void {
    this.pagos.update((arr) => [...arr, { _id: ++this.seq, formaPagoId: null, valor: null }]);
  }
  quitarPago(id: number): void {
    this.pagos.update((arr) => arr.filter((p) => p._id !== id));
  }
  agregarAplicacion(): void {
    this.aplicaciones.update((arr) => [...arr, { _id: ++this.seq, cuentaPorCobrarId: null, valorAplicado: null }]);
  }
  quitarAplicacion(id: number): void {
    this.aplicaciones.update((arr) => arr.filter((l) => l._id !== id));
  }

  volver(): void {
    void this.router.navigate(['/recibos']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Selecciona la caja y la fecha');
      return;
    }
    const pagos: CreateReciboCajaPagoDto[] = this.pagos()
      .filter((p) => (p.valor ?? 0) > 0)
      .map((p) => ({
        formaPagoId: p.formaPagoId,
        valor: p.valor,
        bancoId: null,
        numeroCheque: null,
        numeroTarjeta: null,
        cuentaBancaria: null,
      }));
    if (pagos.length === 0) {
      this.alert.error('Agrega al menos un medio de pago con valor');
      return;
    }
    const lineas: CreateReciboCajaLineaDto[] = this.aplicaciones()
      .filter((l) => l.cuentaPorCobrarId != null && (l.valorAplicado ?? 0) > 0)
      .map((l) => ({ cuentaPorCobrarId: l.cuentaPorCobrarId, valorAplicado: l.valorAplicado }));
    if (this.totalAplicado() > this.totalPagos()) {
      this.alert.error('La aplicación a cartera supera el valor del recibo');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      await lastValueFrom(this.service.create({ ...v, tipoDocumentoId: null, pagos, lineas }));
      this.alert.success('Recibo de caja registrado');
      this.volver();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.loading.set(false);
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo guardar el recibo';
  }
}

function formatNum(v: number | null): string {
  return new Intl.NumberFormat('es-CO').format(v ?? 0);
}
