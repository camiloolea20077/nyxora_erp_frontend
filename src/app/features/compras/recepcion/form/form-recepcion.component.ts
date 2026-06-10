import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { RecepcionService } from '../services/recepcion.service';
import { OrdenCompraService } from '../../orden-compra/services/orden-compra.service';
import { OrdenCompraTableModel } from '../../orden-compra/models/orden-compra.model';
import { TipoDocumentoService } from '../../../administracion/tipo-documento/services/tipo-documento.service';
import { TipoDocumentoTableModel } from '../../../administracion/tipo-documento/models/tipo-documento.model';
import { BodegaService } from '../../../inventario/bodega/services/bodega.service';
import { BodegaTableModel } from '../../../inventario/bodega/models/bodega.model';
import { LoteService } from '../../../inventario/lote/services/lote.service';
import { LoteTableModel } from '../../../inventario/lote/models/lote.model';
import { UbicacionService } from '../../../inventario/ubicacion/services/ubicacion.service';
import { UbicacionTableModel } from '../../../inventario/ubicacion/models/ubicacion.model';
import { ProductoService } from '../../../comun/producto/services/producto.service';

interface Linea {
  _id: number;
  ordenCompraLineaId: number | null;
  productoId: number | null;
  productoNombre: string;
  cantidadPendiente: number;
  cantidadRecibida: number | null;
  costoUnitario: number | null;
  loteId: number | null;
  ubicacionId: number | null;
}

@Component({
  selector: 'app-form-recepcion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule],
  templateUrl: './form-recepcion.component.html',
  styleUrl: './form-recepcion.component.css',
})
export class FormRecepcionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RecepcionService);
  private readonly ordenService = inject(OrdenCompraService);
  private readonly tipoDocService = inject(TipoDocumentoService);
  private readonly bodegaService = inject(BodegaService);
  private readonly loteService = inject(LoteService);
  private readonly ubicacionService = inject(UbicacionService);
  private readonly productoService = inject(ProductoService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly ordenes = signal<OrdenCompraTableModel[]>([]);
  readonly tiposDocumento = signal<TipoDocumentoTableModel[]>([]);
  readonly bodegas = signal<BodegaTableModel[]>([]);
  readonly lotes = signal<LoteTableModel[]>([]);
  readonly ubicaciones = signal<UbicacionTableModel[]>([]);
  private readonly productosMap = signal<Map<number, string>>(new Map());

  private seq = 0;
  readonly lineas = signal<Linea[]>([]);

  readonly frm = this.fb.group({
    ordenCompraId: this.fb.control<number | null>(null, [Validators.required]),
    bodegaId: this.fb.control<number | null>(null, [Validators.required]),
    tipoDocumentoId: this.fb.control<number | null>(null, [Validators.required]),
    numero: this.fb.control<string | null>(null),
    fecha: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [Validators.required]),
    observaciones: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [ord, tip, bod, lot, ubi, pro] = await Promise.all([
        lastValueFrom(this.ordenService.list(req)),
        lastValueFrom(this.tipoDocService.list(req)),
        lastValueFrom(this.bodegaService.list(req)),
        lastValueFrom(this.loteService.list(req)),
        lastValueFrom(this.ubicacionService.list(req)),
        lastValueFrom(this.productoService.list(req)),
      ]);
      this.ordenes.set(ord.data.content.filter((o) => o.estado === 'aprobada' || o.estado === 'recibida'));
      this.tiposDocumento.set(tip.data.content);
      this.bodegas.set(bod.data.content);
      this.lotes.set(lot.data.content);
      this.ubicaciones.set(ubi.data.content);
      this.productosMap.set(new Map(pro.data.content.map((p) => [p.id, `${p.codigo} · ${p.nombre}`])));
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  async onOrdenChange(id: number | null): Promise<void> {
    if (id == null) {
      this.lineas.set([]);
      return;
    }
    try {
      const res = await lastValueFrom(this.ordenService.getById(id));
      const oc = res.data;
      if (oc.bodegaId != null) this.frm.controls.bodegaId.setValue(oc.bodegaId);
      this.lineas.set(
        oc.lineas
          .filter((l) => (l.cantidadPendiente ?? 0) > 0)
          .map((l) => ({
            _id: ++this.seq,
            ordenCompraLineaId: l.id,
            productoId: l.productoId,
            productoNombre: this.productosMap().get(l.productoId ?? -1) ?? `#${l.productoId}`,
            cantidadPendiente: l.cantidadPendiente ?? 0,
            cantidadRecibida: l.cantidadPendiente ?? 0,
            costoUnitario: l.valorUnitario ?? 0,
            loteId: null,
            ubicacionId: null,
          })),
      );
    } catch {
      this.alert.error('No se pudo cargar la orden');
    }
  }

  volver(): void {
    void this.router.navigate(['/recepciones']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Completa orden, bodega, tipo de documento y fecha');
      return;
    }
    const lineas = this.lineas()
      .filter((l) => (l.cantidadRecibida ?? 0) > 0)
      .map((l) => ({
        ordenCompraLineaId: l.ordenCompraLineaId,
        productoId: l.productoId,
        productoVarianteId: null,
        loteId: l.loteId,
        ubicacionId: l.ubicacionId,
        cantidadRecibida: l.cantidadRecibida,
        costoUnitario: l.costoUnitario,
      }));
    if (lineas.length === 0) {
      this.alert.error('Indica al menos una cantidad recibida');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      await lastValueFrom(this.service.create({ ...v, lineas }));
      this.alert.success('Recepción creada');
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
    return 'No se pudo crear la recepción';
  }
}
