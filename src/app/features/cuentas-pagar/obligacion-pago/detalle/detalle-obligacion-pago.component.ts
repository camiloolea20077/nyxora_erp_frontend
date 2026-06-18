import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../../shared/services/alert.service';
import { ObligacionPagoService } from '../services/obligacion-pago.service';
import { ObligacionPagoModel } from '../models/obligacion-pago.model';

@Component({
  selector: 'app-detalle-obligacion-pago',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ButtonModule, TagModule],
  templateUrl: './detalle-obligacion-pago.component.html',
  styleUrl: './detalle-obligacion-pago.component.css',
})
export class DetalleObligacionPagoComponent {
  private readonly service = inject(ObligacionPagoService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly obligacion = signal<ObligacionPagoModel | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
  }

  private async cargar(id: number): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(id));
      this.obligacion.set(res.data);
    } catch {
      this.alert.error('No se pudo cargar la obligación');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/obligaciones']);
  }

  async anular(): Promise<void> {
    const o = this.obligacion();
    if (!o) return;
    try {
      await lastValueFrom(this.service.anular(o.id));
      this.alert.success('Obligación anulada');
      void this.cargar(o.id);
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
