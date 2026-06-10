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
import { UsuarioService } from '../services/usuario.service';
import { UsuarioModel, UsuarioTableModel } from '../models/usuario.model';
import { FormUsuarioComponent } from '../form/form-usuario.component';
import { AsignarRolComponent } from '../roles/asignar-rol.component';

@Component({
  selector: 'app-index-usuario',
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
    FormUsuarioComponent,
    AsignarRolComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-usuario.component.html',
  styleUrl: './index-usuario.component.css',
})
export class IndexUsuarioComponent {
  private readonly service = inject(UsuarioService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<UsuarioTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<UsuarioModel | null>(null);

  readonly showRoles = signal(false);
  readonly rolUsuarioId = signal<number | null>(null);
  readonly rolUsuarioNombre = signal('');

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
      this.alert.error('No se pudo cargar el listado de usuarios');
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
  async editar(row: UsuarioTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir el usuario');
    }
  }

  roles(row: UsuarioTableModel): void {
    this.rolUsuarioId.set(row.id);
    this.rolUsuarioNombre.set(row.username);
    this.showRoles.set(true);
  }

  eliminar(row: UsuarioTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar el usuario "${row.username}"?`,
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
      this.alert.success('Usuario eliminado');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar el usuario');
    }
  }

  onSaved(): void {
    this.load();
  }
}
