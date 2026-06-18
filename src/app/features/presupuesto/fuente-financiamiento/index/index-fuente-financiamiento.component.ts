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
import { FuenteFinanciamientoService } from '../services/fuente-financiamiento.service';
import { FuenteFinanciamientoModel, FuenteFinanciamientoTableModel } from '../models/fuente-financiamiento.model';
import { FormFuenteFinanciamientoComponent } from '../form/form-fuente-financiamiento.component';

@Component({
  selector: 'app-index-fuente-financiamiento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ConfirmDialogModule, FormFuenteFinanciamientoComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-fuente-financiamiento.component.html',
  styleUrl: './index-fuente-financiamiento.component.css',
})
export class IndexFuenteFinanciamientoComponent {
  private readonly service = inject(FuenteFinanciamientoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<FuenteFinanciamientoTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<FuenteFinanciamientoModel | null>(null);

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
      this.alert.error('No se pudo cargar las fuentes de financiamiento');
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
  async editar(row: FuenteFinanciamientoTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la fuente');
    }
  }
  eliminar(row: FuenteFinanciamientoTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la fuente "${row.nombre}"?`,
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
      this.alert.success('Fuente eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la fuente');
    }
  }

  onSaved(): void {
    this.load();
  }
}
