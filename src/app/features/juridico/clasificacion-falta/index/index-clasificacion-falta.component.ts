import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { ClasificacionFaltaService } from '../services/clasificacion-falta.service';
import { ClasificacionFaltaModel, ClasificacionFaltaTableModel } from '../models/clasificacion-falta.model';
import { FormClasificacionFaltaComponent } from '../form/form-clasificacion-falta.component';

@Component({
  selector: 'app-index-clasificacion-falta',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ConfirmDialogModule, FormClasificacionFaltaComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-clasificacion-falta.component.html',
  styleUrl: './index-clasificacion-falta.component.css',
})
export class IndexClasificacionFaltaComponent {
  private readonly service = inject(ClasificacionFaltaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<ClasificacionFaltaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<ClasificacionFaltaModel | null>(null);

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
      this.alert.error('No se pudieron cargar las clasificaciones');
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
  async editar(row: ClasificacionFaltaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la clasificación');
    }
  }
  eliminar(row: ClasificacionFaltaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la clasificación "${row.nombre}"?`,
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
      this.alert.success('Clasificación eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la clasificación');
    }
  }

  onSaved(): void {
    this.load();
  }
}
