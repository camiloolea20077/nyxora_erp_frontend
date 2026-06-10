import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { MovimientoService } from '../services/movimiento.service';
import { BodegaService } from '../../bodega/services/bodega.service';
import { BodegaTableModel } from '../../bodega/models/bodega.model';
import { UbicacionService } from '../../ubicacion/services/ubicacion.service';
import { UbicacionTableModel } from '../../ubicacion/models/ubicacion.model';
import { LoteService } from '../../lote/services/lote.service';
import { LoteTableModel } from '../../lote/models/lote.model';
import { ProductoService } from '../../../comun/producto/services/producto.service';
import { ProductoTableModel } from '../../../comun/producto/models/producto.model';
import { CentroCostoService } from '../../../organizacion/centro-costo/services/centro-costo.service';
import { CentroCostoTableModel } from '../../../organizacion/centro-costo/models/centro-costo.model';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-index-movimiento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule],
  templateUrl: './index-movimiento.component.html',
  styleUrl: './index-movimiento.component.css',
})
export class IndexMovimientoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MovimientoService);
  private readonly bodegaService = inject(BodegaService);
  private readonly ubicacionService = inject(UbicacionService);
  private readonly loteService = inject(LoteService);
  private readonly productoService = inject(ProductoService);
  private readonly centroService = inject(CentroCostoService);
  private readonly alert = inject(AlertService);

  readonly loading = signal(false);
  readonly bodegas = signal<BodegaTableModel[]>([]);
  readonly ubicaciones = signal<UbicacionTableModel[]>([]);
  readonly lotes = signal<LoteTableModel[]>([]);
  readonly productos = signal<ProductoTableModel[]>([]);
  readonly centros = signal<CentroCostoTableModel[]>([]);

  readonly tipos: Opcion[] = [
    { label: 'Entrada', value: 'entrada' },
    { label: 'Salida', value: 'salida' },
    { label: 'Ajuste', value: 'ajuste' },
  ];

  readonly frm = this.fb.group({
    tipo: this.fb.nonNullable.control('entrada', [Validators.required]),
    bodegaId: this.fb.control<number | null>(null, [Validators.required]),
    ubicacionId: this.fb.control<number | null>(null),
    productoId: this.fb.control<number | null>(null, [Validators.required]),
    loteId: this.fb.control<number | null>(null),
    fecha: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [
      Validators.required,
    ]),
    cantidad: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.0001)]),
    costoUnitario: this.fb.control<number | null>(0),
    centroCostoId: this.fb.control<number | null>(null),
    descripcion: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [bod, ubi, lot, pro, cen] = await Promise.all([
        lastValueFrom(this.bodegaService.list(req)),
        lastValueFrom(this.ubicacionService.list(req)),
        lastValueFrom(this.loteService.list(req)),
        lastValueFrom(this.productoService.list(req)),
        lastValueFrom(this.centroService.list(req)),
      ]);
      this.bodegas.set(bod.data.content);
      this.ubicaciones.set(ubi.data.content);
      this.lotes.set(lot.data.content);
      this.productos.set(pro.data.content);
      this.centros.set(cen.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  isInvalid(field: 'bodegaId' | 'productoId' | 'cantidad'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }

  async registrar(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Completa tipo, bodega, producto y cantidad');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      await lastValueFrom(
        this.service.create({
          tipo: v.tipo,
          bodegaId: v.bodegaId,
          ubicacionId: v.ubicacionId,
          productoId: v.productoId,
          loteId: v.loteId,
          fecha: v.fecha,
          cantidad: v.cantidad,
          costoUnitario: v.costoUnitario,
          centroCostoId: v.centroCostoId,
          terceroId: null,
          descripcion: v.descripcion,
        }),
      );
      this.alert.success('Movimiento registrado');
      this.frm.reset({
        tipo: v.tipo,
        bodegaId: v.bodegaId,
        ubicacionId: null,
        productoId: null,
        loteId: null,
        fecha: v.fecha,
        cantidad: null,
        costoUnitario: 0,
        centroCostoId: null,
        descripcion: null,
      });
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
    return 'No se pudo registrar el movimiento';
  }
}
