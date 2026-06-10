import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../services/alert.service';
import { TerceroService } from '../../../features/comun/tercero/services/tercero.service';
import { TerceroTableModel } from '../../../features/comun/tercero/models/tercero.model';

interface OpcionPersona {
  label: string;
  value: string | null;
}

/**
 * Modal reutilizable para buscar/seleccionar un tercero, con filtros avanzados.
 * El consumidor pasa `tipoTerceroId` para acotar (p. ej. proveedores); dentro se filtra
 * además por nombre/documento, número de documento y tipo de persona.
 */
@Component({
  selector: 'app-tercero-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DialogModule, TableModule, ButtonModule, InputTextModule, SelectModule, TagModule],
  templateUrl: './tercero-selector.component.html',
  styleUrl: './tercero-selector.component.css',
})
export class TerceroSelectorComponent {
  private readonly service = inject(TerceroService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly tipoTerceroId = input<number | null>(null);
  readonly header = input('Buscar tercero');

  readonly selected = output<TerceroTableModel>();

  // Filtros (ngModel, no DTO principal)
  search = '';
  numeroDocumento = '';
  tipoPersona: string | null = null;

  readonly personas: OpcionPersona[] = [
    { label: 'Todos', value: null },
    { label: 'Natural', value: 'natural' },
    { label: 'Jurídica', value: 'juridica' },
  ];

  readonly rows = signal<TerceroTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(
        this.service.list({
          page: this.page(),
          rows: this.pageSize(),
          search: this.search || null,
          params: {
            tipoTerceroId: this.tipoTerceroId(),
            numeroDocumento: this.numeroDocumento || null,
            tipoPersona: this.tipoPersona,
          },
        }),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo buscar terceros');
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
    this.numeroDocumento = '';
    this.tipoPersona = null;
    this.buscar();
  }

  seleccionar(row: TerceroTableModel): void {
    this.selected.emit(row);
    this.visible.set(false);
  }

  close(): void {
    this.visible.set(false);
  }
}
