import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { VigenciaService } from '../services/vigencia.service';
import { VigenciaModel, VigenciaStatus, VigenciaTableModel } from '../models/vigencia.model';
import { FormVigenciaComponent } from '../form/form-vigencia.component';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

@Component({
  selector: 'app-index-vigencia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    FormVigenciaComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-vigencia.component.html',
  styleUrl: './index-vigencia.component.css',
})
export class IndexVigenciaComponent {
  private readonly service = inject(VigenciaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<VigenciaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<VigenciaModel | null>(null);

  private readonly statusMeta: Record<VigenciaStatus, { label: string; severity: TagSeverity }> = {
    planeada: { label: 'Planeada', severity: 'info' },
    abierta: { label: 'Abierta', severity: 'success' },
    en_cierre: { label: 'En cierre', severity: 'warn' },
    cerrada: { label: 'Cerrada', severity: 'secondary' },
  };

  statusLabel(s: VigenciaStatus): string {
    return this.statusMeta[s].label;
  }
  statusSeverity(s: VigenciaStatus): TagSeverity {
    return this.statusMeta[s].severity;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(
        this.service.list({ page: this.page(), rows: this.pageSize(), search: this.search || null }),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar el listado de vigencias');
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
  onSearch(): void {
    this.page.set(0);
    this.load();
  }

  nuevo(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }
  async editar(row: VigenciaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la vigencia');
    }
  }

  async abrir(row: VigenciaTableModel): Promise<void> {
    try {
      await lastValueFrom(this.service.abrir(row.id));
      this.alert.success(`Vigencia ${row.year} abierta`);
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo abrir la vigencia'));
    }
  }
  async cerrar(row: VigenciaTableModel): Promise<void> {
    try {
      await lastValueFrom(this.service.cerrar(row.id));
      this.alert.success(`Vigencia ${row.year} cerrada`);
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo cerrar la vigencia'));
    }
  }

  eliminar(row: VigenciaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la vigencia ${row.year}?`,
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
      this.alert.success('Vigencia eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la vigencia');
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
