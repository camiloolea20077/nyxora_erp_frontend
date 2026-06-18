import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { ObligacionPagoService } from '../services/obligacion-pago.service';
import { ObligacionPagoTableModel } from '../models/obligacion-pago.model';

type TagSeverity = 'success' | 'warn' | 'secondary' | 'danger' | 'info';

@Component({
  selector: 'app-index-obligacion-pago',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, TableModule, ButtonModule, TagModule, TooltipModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-obligacion-pago.component.html',
  styleUrl: './index-obligacion-pago.component.css',
})
export class IndexObligacionPagoComponent {
  private readonly service = inject(ObligacionPagoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<ObligacionPagoTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'pagada') return 'success';
    if (estado === 'pendiente') return 'warn';
    if (estado === 'parcial') return 'info';
    if (estado === 'anulada') return 'danger';
    return 'secondary';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.list({ page: this.page(), rows: this.pageSize() }));
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar las obligaciones');
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

  nuevo(): void {
    void this.router.navigate(['/obligaciones/nuevo']);
  }
  ver(row: ObligacionPagoTableModel): void {
    void this.router.navigate(['/obligaciones', row.id]);
  }
  anular(row: ObligacionPagoTableModel): void {
    this.confirm.confirm({
      message: `¿Anular la obligación #${row.id}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doAnular(row.id),
    });
  }
  private async doAnular(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.anular(id));
      this.alert.success('Obligación anulada');
      this.load();
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
