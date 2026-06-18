import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { LiquidacionNominaService } from '../services/liquidacion-nomina.service';
import { LiquidacionNominaTableModel } from '../models/liquidacion-nomina.model';
import { FormLiquidacionNominaComponent } from '../form/form-liquidacion-nomina.component';

const SEVERIDAD: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
  abierto: 'info',
  liquidado: 'warn',
  revisado: 'warn',
  contabilizado: 'success',
  cerrado: 'secondary',
  anulado: 'danger',
};

@Component({
  selector: 'app-index-liquidacion-nomina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    FormLiquidacionNominaComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-liquidacion-nomina.component.html',
  styleUrl: './index-liquidacion-nomina.component.css',
})
export class IndexLiquidacionNominaComponent {
  private readonly service = inject(LiquidacionNominaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<LiquidacionNominaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  readonly showForm = signal(false);

  severidad(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return SEVERIDAD[estado] ?? 'info';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(
        this.service.list({ page: this.page(), rows: this.pageSize() }),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudieron cargar las liquidaciones');
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
    this.showForm.set(true);
  }
  abrir(row: LiquidacionNominaTableModel): void {
    void this.router.navigate(['/liquidaciones', row.id]);
  }
  eliminar(row: LiquidacionNominaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la liquidación ${row.anio}-${row.mes}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doDelete(row.id),
    });
  }
  private async doDelete(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.delete(id));
      this.alert.success('Liquidación eliminada');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo eliminar la liquidación'));
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
