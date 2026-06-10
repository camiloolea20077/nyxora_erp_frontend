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
import { BodegaService } from '../services/bodega.service';
import { BodegaModel, BodegaTableModel } from '../models/bodega.model';
import { FormBodegaComponent } from '../form/form-bodega.component';
import { ResponsablesBodegaComponent } from '../responsables/responsables-bodega.component';

@Component({
  selector: 'app-index-bodega',
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
    FormBodegaComponent,
    ResponsablesBodegaComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-bodega.component.html',
  styleUrl: './index-bodega.component.css',
})
export class IndexBodegaComponent {
  private readonly service = inject(BodegaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<BodegaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<BodegaModel | null>(null);

  readonly showResp = signal(false);
  readonly respBodegaId = signal<number | null>(null);
  readonly respBodegaNombre = signal('');

  responsables(row: BodegaTableModel): void {
    this.respBodegaId.set(row.id);
    this.respBodegaNombre.set(row.nombre);
    this.showResp.set(true);
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
      this.alert.error('No se pudo cargar el listado de bodegas');
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
  async editar(row: BodegaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la bodega');
    }
  }

  eliminar(row: BodegaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la bodega "${row.nombre}"?`,
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
      this.alert.success('Bodega eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la bodega');
    }
  }

  onSaved(): void {
    this.load();
  }
}
