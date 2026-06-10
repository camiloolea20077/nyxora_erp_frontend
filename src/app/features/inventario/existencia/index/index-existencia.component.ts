import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { ExistenciaService } from '../services/existencia.service';
import { SaldoInventarioModel } from '../models/existencia.model';
import { MovimientoService } from '../../movimiento/services/movimiento.service';
import { KardexItem } from '../../movimiento/models/movimiento.model';
import { BodegaService } from '../../bodega/services/bodega.service';
import { BodegaTableModel } from '../../bodega/models/bodega.model';
import { ProductoService } from '../../../comun/producto/services/producto.service';
import { ProductoTableModel } from '../../../comun/producto/models/producto.model';

@Component({
  selector: 'app-index-existencia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, SelectModule],
  templateUrl: './index-existencia.component.html',
  styleUrl: './index-existencia.component.css',
})
export class IndexExistenciaComponent {
  private readonly service = inject(ExistenciaService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly bodegaService = inject(BodegaService);
  private readonly productoService = inject(ProductoService);
  private readonly alert = inject(AlertService);

  readonly bodegas = signal<BodegaTableModel[]>([]);
  readonly productos = signal<ProductoTableModel[]>([]);
  private readonly productosMap = signal<Map<number, string>>(new Map());

  readonly saldos = signal<SaldoInventarioModel[]>([]);
  readonly loadingSaldos = signal(false);
  readonly recalculando = signal(false);
  bodegaId: number | null = null;
  productoFiltroId: number | null = null;

  readonly kardex = signal<KardexItem[]>([]);
  readonly loadingKardex = signal(false);
  kardexProductoId: number | null = null;
  kardexBodegaId: number | null = null;

  constructor() {
    void this.cargar();
  }

  nombreProducto(id: number | null): string {
    if (id == null) return '';
    return this.productosMap().get(id) ?? `#${id}`;
  }

  private async cargar(): Promise<void> {
    try {
      const [bod, pro] = await Promise.all([
        lastValueFrom(this.bodegaService.list({ page: 0, rows: 500 })),
        lastValueFrom(this.productoService.list({ page: 0, rows: 5000 })),
      ]);
      this.bodegas.set(bod.data.content);
      this.productos.set(pro.data.content);
      this.productosMap.set(new Map(pro.data.content.map((p) => [p.id, `${p.codigo} · ${p.nombre}`])));
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  async consultar(): Promise<void> {
    if (this.bodegaId == null) {
      this.alert.error('Selecciona una bodega');
      return;
    }
    this.loadingSaldos.set(true);
    try {
      const res = await lastValueFrom(this.service.consultar(this.bodegaId, this.productoFiltroId));
      this.saldos.set(res.data);
    } catch {
      this.saldos.set([]);
      this.alert.error('No se pudieron consultar las existencias');
    } finally {
      this.loadingSaldos.set(false);
    }
  }

  async recalcular(): Promise<void> {
    if (this.bodegaId == null) {
      this.alert.error('Selecciona una bodega');
      return;
    }
    this.recalculando.set(true);
    try {
      const res = await lastValueFrom(this.service.recalcular(this.bodegaId));
      this.alert.success(`Existencias recalculadas (${res.data})`);
      await this.consultar();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudieron recalcular'));
    } finally {
      this.recalculando.set(false);
    }
  }

  async verKardex(): Promise<void> {
    if (this.kardexProductoId == null) {
      this.alert.error('Selecciona un producto');
      return;
    }
    this.loadingKardex.set(true);
    try {
      const res = await lastValueFrom(this.movimientoService.kardex(this.kardexProductoId, this.kardexBodegaId));
      this.kardex.set(res.data);
    } catch {
      this.kardex.set([]);
      this.alert.error('No se pudo cargar el kardex');
    } finally {
      this.loadingKardex.set(false);
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
