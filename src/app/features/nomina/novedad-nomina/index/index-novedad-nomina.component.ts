import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { NovedadNominaService } from '../services/novedad-nomina.service';
import { NovedadNominaModel, NovedadNominaTableModel } from '../models/novedad-nomina.model';
import { FormNovedadNominaComponent } from '../form/form-novedad-nomina.component';

@Component({
  selector: 'app-index-novedad-nomina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DecimalPipe, TableModule, ButtonModule, InputTextModule, TagModule, ConfirmDialogModule, FormNovedadNominaComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-novedad-nomina.component.html',
  styleUrl: './index-novedad-nomina.component.css',
})
export class IndexNovedadNominaComponent {
  private readonly service = inject(NovedadNominaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<NovedadNominaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<NovedadNominaModel | null>(null);

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
      this.alert.error('No se pudieron cargar las novedades');
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
  async editar(row: NovedadNominaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la novedad');
    }
  }
  anular(row: NovedadNominaTableModel): void {
    this.confirm.confirm({
      message: '¿Anular esta novedad?',
      header: 'Confirmar anulación',
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
      this.alert.success('Novedad anulada');
      this.load();
    } catch {
      this.alert.error('No se pudo anular la novedad');
    }
  }
  eliminar(row: NovedadNominaTableModel): void {
    this.confirm.confirm({
      message: '¿Eliminar esta novedad?',
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
      this.alert.success('Novedad eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la novedad');
    }
  }

  onSaved(): void {
    this.load();
  }
}
