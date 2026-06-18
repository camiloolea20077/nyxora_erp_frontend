import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { FacturaService } from '../services/factura.service';
import { CreateFacturaLineaDto, FacturaModel } from '../models/factura.model';
import { ResolucionDianService } from '../../resolucion-dian/services/resolucion-dian.service';
import { ResolucionDianTableModel } from '../../resolucion-dian/models/resolucion-dian.model';
import { SedeService } from '../../../administracion/sede/services/sede.service';
import { SedeTableModel } from '../../../administracion/sede/models/sede.model';
import { VigenciaService } from '../../../administracion/vigencia/services/vigencia.service';
import { VigenciaTableModel } from '../../../administracion/vigencia/models/vigencia.model';
import { TipoDocumentoService } from '../../../administracion/tipo-documento/services/tipo-documento.service';
import { TipoDocumentoTableModel } from '../../../administracion/tipo-documento/models/tipo-documento.model';
import { BodegaService } from '../../../inventario/bodega/services/bodega.service';
import { BodegaTableModel } from '../../../inventario/bodega/models/bodega.model';
import { CentroCostoService } from '../../../organizacion/centro-costo/services/centro-costo.service';
import { CentroCostoTableModel } from '../../../organizacion/centro-costo/models/centro-costo.model';
import { ProductoService } from '../../../comun/producto/services/producto.service';
import { ProductoTableModel } from '../../../comun/producto/models/producto.model';
import { ImpuestoService } from '../../../comun/impuesto/services/impuesto.service';
import { ImpuestoTableModel } from '../../../comun/impuesto/models/impuesto.model';

interface Linea {
  _id: number;
  productoId: number | null;
  descripcion: string | null;
  cantidad: number | null;
  valorUnitario: number | null;
  descuentoPorcentaje: number | null;
  impuestoId: number | null;
}

@Component({
  selector: 'app-form-factura',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TerceroSelectorComponent,
  ],
  templateUrl: './form-factura.component.html',
  styleUrl: './form-factura.component.css',
})
export class FormFacturaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FacturaService);
  private readonly resolucionService = inject(ResolucionDianService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly terceroService = inject(TerceroService);
  private readonly sedeService = inject(SedeService);
  private readonly vigenciaService = inject(VigenciaService);
  private readonly tipoDocService = inject(TipoDocumentoService);
  private readonly bodegaService = inject(BodegaService);
  private readonly centroService = inject(CentroCostoService);
  private readonly productoService = inject(ProductoService);
  private readonly impuestoService = inject(ImpuestoService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly facturaId = signal<number | null>(null);
  readonly isEdit = computed(() => this.facturaId() != null);
  private registro: FacturaModel | null = null;

  readonly resoluciones = signal<ResolucionDianTableModel[]>([]);
  readonly sedes = signal<SedeTableModel[]>([]);
  readonly vigencias = signal<VigenciaTableModel[]>([]);
  readonly tiposDocumento = signal<TipoDocumentoTableModel[]>([]);
  readonly bodegas = signal<BodegaTableModel[]>([]);
  readonly centros = signal<CentroCostoTableModel[]>([]);
  readonly condiciones = signal<CatalogoItem[]>([]);
  readonly productos = signal<ProductoTableModel[]>([]);
  readonly impuestos = signal<ImpuestoTableModel[]>([]);

  readonly showSelector = signal(false);
  readonly clienteNombre = signal<string | null>(null);

  private seq = 0;
  readonly lineas = signal<Linea[]>([]);
  readonly subtotal = signal(0);
  readonly descuento = signal(0);
  readonly impuesto = signal(0);
  readonly total = computed(() => this.subtotal() - this.descuento() + this.impuesto());

  readonly frm = this.fb.group({
    clienteId: this.fb.control<number | null>(null, [Validators.required]),
    resolucionDianId: this.fb.control<number | null>(null),
    tipoDocumentoId: this.fb.control<number | null>(null),
    numero: this.fb.control<string | null>(null),
    bodegaId: this.fb.control<number | null>(null),
    centroCostoId: this.fb.control<number | null>(null),
    condicionPagoId: this.fb.control<number | null>(null),
    sedeId: this.fb.control<number | null>(null),
    vigenciaId: this.fb.control<number | null>(null),
    fecha: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [
      Validators.required,
    ]),
    fechaVencimiento: this.fb.control<string | null>(null),
    observaciones: this.fb.control<string | null>(null),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.facturaId.set(idParam ? Number(idParam) : null);
    void this.init();
  }

  private async init(): Promise<void> {
    await this.cargarCatalogos();
    const id = this.facturaId();
    if (id != null) {
      try {
        const res = await lastValueFrom(this.service.getById(id));
        this.registro = res.data;
        if (res.data.estado !== 'borrador') {
          this.alert.error('Solo se editan facturas en borrador');
          this.volver();
          return;
        }
        this.aplicar(res.data);
      } catch {
        this.alert.error('No se pudo cargar la factura');
        this.volver();
      }
    } else {
      this.agregar();
    }
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [res, sed, vig, tip, bod, cen, con, pro, imp] = await Promise.all([
        lastValueFrom(this.resolucionService.list(req)),
        lastValueFrom(this.sedeService.list(req)),
        lastValueFrom(this.vigenciaService.list(req)),
        lastValueFrom(this.tipoDocService.list(req)),
        lastValueFrom(this.bodegaService.list(req)),
        lastValueFrom(this.centroService.list(req)),
        lastValueFrom(this.catalogoService.list('condicion-pago', req)),
        lastValueFrom(this.productoService.list(req)),
        lastValueFrom(this.impuestoService.list(req)),
      ]);
      this.resoluciones.set(res.data.content);
      this.sedes.set(sed.data.content);
      this.vigencias.set(vig.data.content);
      this.tiposDocumento.set(tip.data.content);
      this.bodegas.set(bod.data.content);
      this.centros.set(cen.data.content);
      this.condiciones.set(con.data.content);
      this.productos.set(pro.data.content);
      this.impuestos.set(imp.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  private aplicar(f: FacturaModel): void {
    this.frm.reset({
      clienteId: f.clienteId,
      resolucionDianId: f.resolucionDianId,
      tipoDocumentoId: f.tipoDocumentoId,
      numero: f.numero,
      bodegaId: f.bodegaId,
      centroCostoId: f.centroCostoId,
      condicionPagoId: f.condicionPagoId,
      sedeId: f.sedeId,
      vigenciaId: f.vigenciaId,
      fecha: f.fecha,
      fechaVencimiento: f.fechaVencimiento,
      observaciones: f.observaciones,
    });
    this.lineas.set(
      f.lineas.map((l) => ({
        _id: ++this.seq,
        productoId: l.productoId,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        valorUnitario: l.valorUnitario,
        descuentoPorcentaje: l.descuentoPorcentaje,
        impuestoId: l.impuestoId,
      })),
    );
    if (f.clienteId != null) void this.resolverCliente(f.clienteId);
    this.recalc();
  }

  private async resolverCliente(id: number): Promise<void> {
    try {
      const res = await lastValueFrom(this.terceroService.getById(id));
      this.clienteNombre.set(res.data.nombre ?? `Tercero #${id}`);
    } catch {
      this.clienteNombre.set(`Tercero #${id}`);
    }
  }

  openSelector(): void {
    this.showSelector.set(true);
  }
  onClienteSelected(t: TerceroTableModel): void {
    this.frm.controls.clienteId.setValue(t.id);
    this.clienteNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }

  agregar(): void {
    this.lineas.update((arr) => [
      ...arr,
      {
        _id: ++this.seq,
        productoId: null,
        descripcion: null,
        cantidad: 1,
        valorUnitario: 0,
        descuentoPorcentaje: 0,
        impuestoId: null,
      },
    ]);
  }
  quitar(id: number): void {
    this.lineas.update((arr) => arr.filter((l) => l._id !== id));
    this.recalc();
  }

  private impuestoDe(id: number | null): ImpuestoTableModel | undefined {
    return id == null ? undefined : this.impuestos().find((i) => i.id === id);
  }

  /** Monto del impuesto de la línea (en $); negativo si es retención. */
  private impuestoLinea(l: Linea, baseGravable: number): number {
    const imp = this.impuestoDe(l.impuestoId);
    if (!imp?.tarifa) return 0;
    const monto = baseGravable * (imp.tarifa / 100);
    return imp.tipo === 'retencion' ? -monto : monto;
  }

  /** Neto de la línea con impuesto incluido (base − descuento ± impuesto). */
  lineaNeto(l: Linea): number {
    const base = (l.cantidad ?? 0) * (l.valorUnitario ?? 0);
    const baseGravable = base * (1 - (l.descuentoPorcentaje ?? 0) / 100);
    return baseGravable + this.impuestoLinea(l, baseGravable);
  }

  recalc(): void {
    let sub = 0;
    let desc = 0;
    let imp = 0;
    for (const l of this.lineas()) {
      const base = (l.cantidad ?? 0) * (l.valorUnitario ?? 0);
      const d = base * ((l.descuentoPorcentaje ?? 0) / 100);
      sub += base;
      desc += d;
      imp += this.impuestoLinea(l, base - d);
    }
    this.subtotal.set(sub);
    this.descuento.set(desc);
    this.impuesto.set(imp);
  }

  volver(): void {
    void this.router.navigate(['/facturas']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Completa cliente y fecha');
      return;
    }
    const lineas: CreateFacturaLineaDto[] = this.lineas()
      .filter((l) => l.productoId != null && (l.cantidad ?? 0) > 0)
      .map((l) => {
        const base = (l.cantidad ?? 0) * (l.valorUnitario ?? 0);
        const descuentoValor = base * ((l.descuentoPorcentaje ?? 0) / 100);
        const imp = this.impuestoDe(l.impuestoId);
        const valorImpuesto = this.impuestoLinea(l, base - descuentoValor);
        return {
          productoId: l.productoId,
          productoVarianteId: null,
          descripcion: l.descripcion,
          cantidad: l.cantidad,
          unidadMedidaId: null,
          valorUnitario: l.valorUnitario,
          descuentoPorcentaje: l.descuentoPorcentaje,
          descuentoValor,
          impuestoId: l.impuestoId,
          porcentajeImpuesto: imp?.tarifa ?? null,
          valorImpuesto,
          discriminaIva: imp != null && imp.tipo !== 'retencion',
          bodegaId: null,
          loteId: null,
          centroCostoId: null,
        };
      });
    if (lineas.length === 0) {
      this.alert.error('Agrega al menos una línea con producto y cantidad');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      const r = this.registro;
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...v, lineas }));
      } else {
        await lastValueFrom(this.service.create({ ...v, lineas }));
      }
      this.alert.success('Factura guardada');
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
    return 'No se pudo guardar la factura';
  }
}
