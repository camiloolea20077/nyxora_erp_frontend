import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { AsignaturaService } from '../services/asignatura.service';
import { AsignaturaModel, AsignaturaTableModel } from '../models/asignatura.model';
import { FormAsignaturaComponent } from '../form/form-asignatura.component';
import { ProgramasAsignaturaComponent } from '../satelites/programas-asignatura.component';

@Component({
  selector: 'app-index-asignatura',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    FormAsignaturaComponent,
    ProgramasAsignaturaComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-asignatura.component.html',
  styleUrl: './index-asignatura.component.css',
})
export class IndexAsignaturaComponent {
  private readonly service = inject(AsignaturaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<AsignaturaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<AsignaturaModel | null>(null);

  readonly showProgramas = signal(false);
  readonly programasAsignaturaId = signal<number | null>(null);
  readonly programasAsignaturaNombre = signal('');

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
      this.alert.error('No se pudieron cargar las asignaturas');
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
  async editar(row: AsignaturaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la asignatura');
    }
  }
  programas(row: AsignaturaTableModel): void {
    this.programasAsignaturaId.set(row.id);
    this.programasAsignaturaNombre.set(row.nombre);
    this.showProgramas.set(true);
  }
  eliminar(row: AsignaturaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la asignatura "${row.nombre}"?`,
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
      this.alert.success('Asignatura eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la asignatura');
    }
  }

  onSaved(): void {
    this.load();
  }
}
