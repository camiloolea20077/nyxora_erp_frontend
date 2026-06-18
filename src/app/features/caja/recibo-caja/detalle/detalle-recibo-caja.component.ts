import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../../shared/services/alert.service';
import { ReciboCajaService } from '../services/recibo-caja.service';
import { ReciboCajaModel } from '../models/recibo-caja.model';

@Component({
  selector: 'app-detalle-recibo-caja',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ButtonModule, TagModule],
  templateUrl: './detalle-recibo-caja.component.html',
  styleUrl: './detalle-recibo-caja.component.css',
})
export class DetalleReciboCajaComponent {
  private readonly service = inject(ReciboCajaService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly recibo = signal<ReciboCajaModel | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
  }

  private async cargar(id: number): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(id));
      this.recibo.set(res.data);
    } catch {
      this.alert.error('No se pudo cargar el recibo');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/recibos']);
  }

  async anular(): Promise<void> {
    const r = this.recibo();
    if (!r) return;
    try {
      await lastValueFrom(this.service.anular(r.id));
      this.alert.success('Recibo anulado');
      void this.cargar(r.id);
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo anular';
  }
}
