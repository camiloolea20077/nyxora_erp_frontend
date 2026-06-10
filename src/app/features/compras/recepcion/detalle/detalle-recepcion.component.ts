import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../../shared/services/alert.service';
import { RecepcionService } from '../services/recepcion.service';
import { RecepcionModel } from '../models/recepcion.model';
import { ProductoService } from '../../../comun/producto/services/producto.service';

@Component({
  selector: 'app-detalle-recepcion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ButtonModule, TagModule],
  templateUrl: './detalle-recepcion.component.html',
  styleUrl: './detalle-recepcion.component.css',
})
export class DetalleRecepcionComponent {
  private readonly service = inject(RecepcionService);
  private readonly productoService = inject(ProductoService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly recepcion = signal<RecepcionModel | null>(null);
  private readonly productos = signal<Map<number, string>>(new Map());

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
      const [rec, pro] = await Promise.all([
        lastValueFrom(this.service.getById(id)),
        lastValueFrom(this.productoService.list({ page: 0, rows: 5000 })),
      ]);
      this.recepcion.set(rec.data);
      this.productos.set(new Map(pro.data.content.map((p) => [p.id, `${p.codigo} · ${p.nombre}`])));
    } catch {
      this.alert.error('No se pudo cargar la recepción');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/recepciones']);
  }
}
