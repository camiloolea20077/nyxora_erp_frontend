import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { AcuerdoPagoService } from '../services/acuerdo-pago.service';
import { AcuerdoPagoTableModel } from '../models/acuerdo-pago.model';

type TagSeverity = 'success' | 'warn' | 'secondary' | 'danger';

@Component({
  selector: 'app-index-acuerdo-pago',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, TagModule, TooltipModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-acuerdo-pago.component.html',
  styleUrl: './index-acuerdo-pago.component.css',
})
export class IndexAcuerdoPagoComponent {
  private readonly service = inject(AcuerdoPagoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<AcuerdoPagoTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'cumplido') return 'success';
    if (estado === 'vigente') return 'warn';
    if (estado === 'anulado' || estado === 'incumplido') return 'danger';
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
      this.alert.error('No se pudo cargar los acuerdos de pago');
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
    void this.router.navigate(['/acuerdos-pago/nuevo']);
  }
  ver(row: AcuerdoPagoTableModel): void {
    void this.router.navigate(['/acuerdos-pago', row.id]);
  }
  anular(row: AcuerdoPagoTableModel): void {
    this.confirm.confirm({
      message: `¿Anular el acuerdo #${row.id}? La cuenta por cobrar volverá a 'vigente'.`,
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
      this.alert.success('Acuerdo anulado');
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
