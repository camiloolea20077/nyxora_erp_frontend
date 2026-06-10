import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { PeriodoService } from '../services/periodo.service';
import { PeriodoTableModel } from '../models/periodo.model';
import { nombreMes } from '../meses';
import { FormPeriodoComponent } from '../form/form-periodo.component';

type TagSeverity = 'success' | 'warn' | 'secondary';

@Component({
  selector: 'app-index-periodo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, TagModule, TooltipModule, ConfirmDialogModule, FormPeriodoComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-periodo.component.html',
  styleUrl: './index-periodo.component.css',
})
export class IndexPeriodoComponent {
  private readonly service = inject(PeriodoService);
  private readonly alert = inject(AlertService);

  readonly rows = signal<PeriodoTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(12);

  readonly showForm = signal(false);

  mes = nombreMes;

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'abierto') return 'success';
    if (estado === 'cerrado') return 'secondary';
    return 'warn';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.list({ page: this.page(), rows: this.pageSize() }));
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar el listado de periodos');
    } finally {
      this.loading.set(false);
    }
  }

  onLazy(e: TableLazyLoadEvent): void {
    const rows = e.rows ?? 12;
    this.pageSize.set(rows);
    this.page.set(Math.floor((e.first ?? 0) / rows));
    this.load();
  }

  nuevo(): void {
    this.showForm.set(true);
  }

  async cerrar(row: PeriodoTableModel): Promise<void> {
    try {
      await lastValueFrom(this.service.cerrar(row.id));
      this.alert.success('Periodo cerrado');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo cerrar el periodo'));
    }
  }
  async reabrir(row: PeriodoTableModel): Promise<void> {
    try {
      await lastValueFrom(this.service.reabrir(row.id));
      this.alert.success('Periodo reabierto');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo reabrir el periodo'));
    }
  }

  onSaved(): void {
    this.load();
  }

  private msg(e: unknown, fallback: string): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return fallback;
  }
}
