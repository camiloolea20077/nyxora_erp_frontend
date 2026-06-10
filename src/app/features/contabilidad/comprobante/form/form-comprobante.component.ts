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
import { ComprobanteService } from '../services/comprobante.service';
import { PeriodoService } from '../../periodo/services/periodo.service';
import { PeriodoTableModel } from '../../periodo/models/periodo.model';
import { nombreMes } from '../../periodo/meses';
import { CuentaService } from '../../cuenta/services/cuenta.service';
import { CuentaTableModel } from '../../cuenta/models/cuenta.model';
import { CentroCostoService } from '../../../organizacion/centro-costo/services/centro-costo.service';
import { CentroCostoTableModel } from '../../../organizacion/centro-costo/models/centro-costo.model';
import { TipoDocumentoService } from '../../../administracion/tipo-documento/services/tipo-documento.service';
import { TipoDocumentoTableModel } from '../../../administracion/tipo-documento/models/tipo-documento.model';

interface Linea {
  _id: number;
  cuentaId: number | null;
  centroCostoId: number | null;
  descripcion: string | null;
  debito: number | null;
  credito: number | null;
}

@Component({
  selector: 'app-form-comprobante',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, DecimalPipe, ButtonModule, InputTextModule, InputNumberModule, SelectModule],
  templateUrl: './form-comprobante.component.html',
  styleUrl: './form-comprobante.component.css',
})
export class FormComprobanteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ComprobanteService);
  private readonly periodoService = inject(PeriodoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly centroService = inject(CentroCostoService);
  private readonly tipoDocService = inject(TipoDocumentoService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly periodos = signal<PeriodoTableModel[]>([]);
  readonly cuentas = signal<CuentaTableModel[]>([]);
  readonly centros = signal<CentroCostoTableModel[]>([]);
  readonly tiposDocumento = signal<TipoDocumentoTableModel[]>([]);

  private seq = 0;
  readonly lineas = signal<Linea[]>([]);
  readonly totalDebito = signal(0);
  readonly totalCredito = signal(0);
  readonly balanceado = computed(
    () => this.totalDebito() > 0 && Math.abs(this.totalDebito() - this.totalCredito()) < 0.0001,
  );
  readonly diferencia = computed(() => this.totalDebito() - this.totalCredito());
  readonly periodoOpts = computed(() =>
    this.periodos().map((p) => ({ id: p.id, label: `${p.anio} · ${nombreMes(p.mes)}` })),
  );

  readonly frm = this.fb.group({
    periodoContableId: this.fb.control<number | null>(null, [Validators.required]),
    tipoDocumentoId: this.fb.control<number | null>(null, [Validators.required]),
    numero: this.fb.control<string | null>(null),
    fecha: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [Validators.required]),
    descripcion: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargar();
    this.agregar();
    this.agregar();
  }

  periodoLabel(p: PeriodoTableModel): string {
    return `${p.anio} · ${nombreMes(p.mes)}`;
  }

  private async cargar(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [per, cue, cen, tip] = await Promise.all([
        lastValueFrom(this.periodoService.list(req)),
        lastValueFrom(this.cuentaService.list(req)),
        lastValueFrom(this.centroService.list(req)),
        lastValueFrom(this.tipoDocService.list(req)),
      ]);
      this.periodos.set(per.data.content);
      this.cuentas.set(cue.data.content);
      this.centros.set(cen.data.content);
      this.tiposDocumento.set(tip.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  agregar(): void {
    this.lineas.update((arr) => [
      ...arr,
      { _id: ++this.seq, cuentaId: null, centroCostoId: null, descripcion: null, debito: null, credito: null },
    ]);
  }
  quitar(id: number): void {
    this.lineas.update((arr) => arr.filter((l) => l._id !== id));
    this.recalc();
  }

  recalc(): void {
    let d = 0;
    let c = 0;
    for (const l of this.lineas()) {
      d += l.debito ?? 0;
      c += l.credito ?? 0;
    }
    this.totalDebito.set(d);
    this.totalCredito.set(c);
  }

  volver(): void {
    void this.router.navigate(['/comprobantes']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Completa periodo, tipo de documento y fecha');
      return;
    }
    const movimientos = this.lineas()
      .filter((l) => l.cuentaId != null && ((l.debito ?? 0) > 0 || (l.credito ?? 0) > 0))
      .map((l) => ({
        cuentaId: l.cuentaId,
        centroCostoId: l.centroCostoId,
        descripcion: l.descripcion,
        debito: l.debito ?? 0,
        credito: l.credito ?? 0,
      }));
    if (movimientos.length < 2) {
      this.alert.error('Agrega al menos dos movimientos con cuenta y valor');
      return;
    }
    if (!this.balanceado()) {
      this.alert.error('El comprobante no está balanceado (débito ≠ crédito)');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      await lastValueFrom(this.service.create({ ...v, movimientos }));
      this.alert.success('Comprobante creado');
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
    return 'No se pudo crear el comprobante';
  }
}
