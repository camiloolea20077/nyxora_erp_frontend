import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { FacturaService } from '../services/factura.service';
import { FacturaModel } from '../models/factura.model';
import { ProductoService } from '../../../comun/producto/services/producto.service';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { CuentaService } from '../../../contabilidad/cuenta/services/cuenta.service';
import { CuentaTableModel } from '../../../contabilidad/cuenta/models/cuenta.model';
import { PeriodoService } from '../../../contabilidad/periodo/services/periodo.service';
import { PeriodoTableModel } from '../../../contabilidad/periodo/models/periodo.model';
import { nombreMes } from '../../../contabilidad/periodo/meses';

interface EstadoDianOpt {
  label: string;
  value: string;
}

@Component({
  selector: 'app-detalle-factura',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    TagModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalle-factura.component.html',
  styleUrl: './detalle-factura.component.css',
})
export class DetalleFacturaComponent {
  private readonly service = inject(FacturaService);
  private readonly productoService = inject(ProductoService);
  private readonly terceroService = inject(TerceroService);
  private readonly cuentaService = inject(CuentaService);
  private readonly periodoService = inject(PeriodoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly factura = signal<FacturaModel | null>(null);
  readonly clienteNombre = signal<string>('');
  private readonly productos = signal<Map<number, string>>(new Map());
  readonly estado = computed(() => this.factura()?.estado ?? '');

  readonly cuentas = signal<CuentaTableModel[]>([]);
  readonly periodos = signal<PeriodoTableModel[]>([]);
  readonly periodoOpts = computed(() =>
    this.periodos().map((p) => ({ id: p.id, label: `${p.anio} · ${nombreMes(p.mes)}` })),
  );

  readonly estadoDianOpts: EstadoDianOpt[] = [
    { label: 'Enviada', value: 'enviada' },
    { label: 'Aceptada', value: 'aceptada' },
    { label: 'Rechazada', value: 'rechazada' },
  ];

  // emitir dialog
  readonly showEmitir = signal(false);
  readonly emitiendo = signal(false);
  cuentaClienteId: number | null = null;
  cuentaIngresoId: number | null = null;
  cuentaImpuestoId: number | null = null;
  periodoContableId: number | null = null;

  // factura electrónica dialog
  readonly showDian = signal(false);
  readonly guardandoDian = signal(false);
  cufe: string | null = null;
  estadoDian: string | null = null;
  fechaAcuse: string | null = null;
  comentarioAcuse: string | null = null;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
    void this.cargarCatalogos();
  }

  producto(id: number | null): string {
    if (id == null) return '';
    return this.productos().get(id) ?? `#${id}`;
  }

  private async cargarCatalogos(): Promise<void> {
    try {
      const [cue, per] = await Promise.all([
        lastValueFrom(this.cuentaService.list({ page: 0, rows: 5000 })),
        lastValueFrom(this.periodoService.list({ page: 0, rows: 500 })),
      ]);
      this.cuentas.set(cue.data.content);
      this.periodos.set(per.data.content);
    } catch {
      /* ignore */
    }
  }

  private async cargar(id: number): Promise<void> {
    try {
      const [fac, pro] = await Promise.all([
        lastValueFrom(this.service.getById(id)),
        lastValueFrom(this.productoService.list({ page: 0, rows: 5000 })),
      ]);
      this.factura.set(fac.data);
      this.productos.set(new Map(pro.data.content.map((p) => [p.id, `${p.codigo} · ${p.nombre}`])));
      if (fac.data.clienteId != null) {
        try {
          const t = await lastValueFrom(this.terceroService.getById(fac.data.clienteId));
          this.clienteNombre.set(t.data.nombre ?? `#${fac.data.clienteId}`);
        } catch {
          this.clienteNombre.set(`#${fac.data.clienteId}`);
        }
      }
    } catch {
      this.alert.error('No se pudo cargar la factura');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/facturas']);
  }

  // ── emitir ──
  abrirEmitir(): void {
    this.cuentaClienteId = null;
    this.cuentaIngresoId = null;
    this.cuentaImpuestoId = null;
    this.periodoContableId = null;
    this.showEmitir.set(true);
  }
  async emitir(): Promise<void> {
    const f = this.factura();
    if (!f) return;
    this.emitiendo.set(true);
    try {
      await lastValueFrom(
        this.service.emitir(f.id, {
          cuentaClienteId: this.cuentaClienteId,
          cuentaIngresoId: this.cuentaIngresoId,
          cuentaImpuestoId: this.cuentaImpuestoId,
          periodoContableId: this.periodoContableId,
        }),
      );
      this.alert.success('Factura emitida');
      this.showEmitir.set(false);
      void this.cargar(f.id);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo emitir la factura'));
    } finally {
      this.emitiendo.set(false);
    }
  }

  // ── anular ──
  anular(): void {
    const f = this.factura();
    if (!f) return;
    this.confirm.confirm({
      message: '¿Anular la factura? Se reversará el inventario si estaba emitida.',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doAnular(f.id),
    });
  }
  private async doAnular(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.anular(id));
      this.alert.success('Factura anulada');
      void this.cargar(id);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo anular'));
    }
  }

  // ── factura electrónica ──
  abrirDian(): void {
    this.cufe = null;
    this.estadoDian = null;
    this.fechaAcuse = null;
    this.comentarioAcuse = null;
    this.showDian.set(true);
  }
  async guardarDian(): Promise<void> {
    const f = this.factura();
    if (!f) return;
    this.guardandoDian.set(true);
    try {
      await lastValueFrom(
        this.service.registrarDian(f.id, {
          cufe: this.cufe,
          estadoDian: this.estadoDian,
          fechaAcuse: this.fechaAcuse,
          comentarioAcuse: this.comentarioAcuse,
        }),
      );
      this.alert.success('Factura electrónica registrada');
      this.showDian.set(false);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo registrar la factura electrónica'));
    } finally {
      this.guardandoDian.set(false);
    }
  }

  private msg(e: unknown, fallback: string): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return fallback;
  }
}
