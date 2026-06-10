import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../shared/models/catalogo.model';
import { TerceroService } from '../services/tercero.service';
import { TerceroTableModel } from '../models/tercero.model';

interface OpcionPersona {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-index-tercero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-tercero.component.html',
  styleUrl: './index-tercero.component.css',
})
export class IndexTerceroComponent {
  private readonly service = inject(TerceroService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<TerceroTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  // Filtros avanzados
  search = '';
  filtroTipoPersona: string | null = null;
  filtroTipoTerceroId: number | null = null;
  readonly tiposTercero = signal<CatalogoItem[]>([]);
  readonly personas: OpcionPersona[] = [
    { label: 'Todos', value: null },
    { label: 'Natural', value: 'natural' },
    { label: 'Jurídica', value: 'juridica' },
  ];

  constructor() {
    void this.cargarTiposTercero();
  }

  private async cargarTiposTercero(): Promise<void> {
    try {
      const res = await lastValueFrom(this.catalogoService.list('tipo-tercero', { page: 0, rows: 500 }));
      this.tiposTercero.set(res.data.content);
    } catch {
      this.tiposTercero.set([]);
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(
        this.service.list({
          page: this.page(),
          rows: this.pageSize(),
          search: this.search || null,
          params: {
            tipoTerceroId: this.filtroTipoTerceroId,
            tipoPersona: this.filtroTipoPersona,
          },
        }),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar el listado de terceros');
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

  buscar(): void {
    this.page.set(0);
    this.load();
  }

  limpiar(): void {
    this.search = '';
    this.filtroTipoPersona = null;
    this.filtroTipoTerceroId = null;
    this.buscar();
  }

  nuevo(): void {
    void this.router.navigate(['/terceros/nuevo']);
  }
  editar(row: TerceroTableModel): void {
    void this.router.navigate(['/terceros', row.id, 'editar']);
  }

  eliminar(row: TerceroTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar el tercero "${row.nombre}"?`,
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
      this.alert.success('Tercero eliminado');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar el tercero');
    }
  }
}
