import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { AlertService } from '../../../../shared/services/alert.service';
import { ObligacionPagoService } from '../../obligacion-pago/services/obligacion-pago.service';
import { ObligacionPagoTableModel } from '../../obligacion-pago/models/obligacion-pago.model';

@Component({
  selector: 'app-index-retenciones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, TableModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './index-retenciones.component.html',
  styleUrl: './index-retenciones.component.css',
})
export class IndexRetencionesComponent {
  private readonly service = inject(ObligacionPagoService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly rows = signal<ObligacionPagoTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.list({ page: this.page(), rows: this.pageSize() }));
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar las retenciones');
    } finally {
      this.loading.set(false);
    }
  }

  onLazy(e: TableLazyLoadEvent): void {
    const rows = e.rows ?? 10;
    this.pageSize.set(rows);
    this.page.set(Math.floor((e.first ?? 0) / rows));
    this.load();
  }

  ver(row: ObligacionPagoTableModel): void {
    void this.router.navigate(['/obligaciones', row.id]);
  }
}
