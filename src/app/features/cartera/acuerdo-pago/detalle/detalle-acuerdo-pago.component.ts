import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../../shared/services/alert.service';
import { AcuerdoPagoService } from '../services/acuerdo-pago.service';
import { AcuerdoPagoModel } from '../models/acuerdo-pago.model';

@Component({
  selector: 'app-detalle-acuerdo-pago',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ButtonModule, TagModule],
  templateUrl: './detalle-acuerdo-pago.component.html',
  styleUrl: './detalle-acuerdo-pago.component.css',
})
export class DetalleAcuerdoPagoComponent {
  private readonly service = inject(AcuerdoPagoService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly acuerdo = signal<AcuerdoPagoModel | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
  }

  private async cargar(id: number): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(id));
      this.acuerdo.set(res.data);
    } catch {
      this.alert.error('No se pudo cargar el acuerdo');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/acuerdos-pago']);
  }

  async anular(): Promise<void> {
    const a = this.acuerdo();
    if (!a) return;
    try {
      await lastValueFrom(this.service.anular(a.id));
      this.alert.success('Acuerdo anulado');
      void this.cargar(a.id);
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
