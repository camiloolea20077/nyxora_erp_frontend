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
import { EgresoService } from '../services/egreso.service';
import { ComprobanteEgresoTableModel } from '../models/egreso.model';

type TagSeverity = 'success' | 'warn' | 'secondary' | 'danger' | 'info';

@Component({
  selector: 'app-index-egreso',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, TableModule, ButtonModule, TagModule, TooltipModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-egreso.component.html',
  styleUrl: './index-egreso.component.css',
})
export class IndexEgresoComponent {
  private readonly service = inject(EgresoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<ComprobanteEgresoTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'girado') return 'success';
    if (estado === 'borrador') return 'warn';
    if (estado === 'conciliado') return 'info';
    if (estado === 'anulado') return 'danger';
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
      this.alert.error('No se pudo cargar los egresos');
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
    void this.router.navigate(['/egresos/nuevo']);
  }
  ver(row: ComprobanteEgresoTableModel): void {
    void this.router.navigate(['/egresos', row.id]);
  }
  anular(row: ComprobanteEgresoTableModel): void {
    this.confirm.confirm({
      message: `¿Anular el egreso #${row.id}?`,
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
      this.alert.success('Egreso anulado');
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
