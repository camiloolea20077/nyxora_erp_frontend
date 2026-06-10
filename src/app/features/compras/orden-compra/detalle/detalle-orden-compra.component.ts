import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../../shared/services/alert.service';
import { OrdenCompraService } from '../services/orden-compra.service';
import { OrdenCompraModel } from '../models/orden-compra.model';
import { ProductoService } from '../../../comun/producto/services/producto.service';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';

@Component({
  selector: 'app-detalle-orden-compra',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ButtonModule, TagModule],
  templateUrl: './detalle-orden-compra.component.html',
  styleUrl: './detalle-orden-compra.component.css',
})
export class DetalleOrdenCompraComponent {
  private readonly service = inject(OrdenCompraService);
  private readonly productoService = inject(ProductoService);
  private readonly terceroService = inject(TerceroService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly orden = signal<OrdenCompraModel | null>(null);
  readonly proveedorNombre = signal<string>('');
  private readonly productos = signal<Map<number, string>>(new Map());
  readonly estado = computed(() => this.orden()?.estado ?? '');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
  }

  producto(id: number | null): string {
    if (id == null) return '';
    return this.productos().get(id) ?? `#${id}`;
  }

  private async cargar(id: number): Promise<void> {
    try {
      const [oc, pro] = await Promise.all([
        lastValueFrom(this.service.getById(id)),
        lastValueFrom(this.productoService.list({ page: 0, rows: 5000 })),
      ]);
      this.orden.set(oc.data);
      this.productos.set(new Map(pro.data.content.map((p) => [p.id, `${p.codigo} · ${p.nombre}`])));
      if (oc.data.proveedorId != null) {
        try {
          const t = await lastValueFrom(this.terceroService.getById(oc.data.proveedorId));
          this.proveedorNombre.set(t.data.nombre ?? `#${oc.data.proveedorId}`);
        } catch {
          this.proveedorNombre.set(`#${oc.data.proveedorId}`);
        }
      }
    } catch {
      this.alert.error('No se pudo cargar la orden');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/ordenes-compra']);
  }

  async aprobar(): Promise<void> {
    const o = this.orden();
    if (!o) return;
    try {
      await lastValueFrom(this.service.aprobar(o.id));
      this.alert.success('Orden aprobada');
      void this.cargar(o.id);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo aprobar'));
    }
  }
  async anular(): Promise<void> {
    const o = this.orden();
    if (!o) return;
    try {
      await lastValueFrom(this.service.anular(o.id));
      this.alert.success('Orden anulada');
      void this.cargar(o.id);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo anular'));
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
