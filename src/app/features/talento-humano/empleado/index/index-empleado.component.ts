import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';

@Component({
  selector: 'app-index-empleado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TableModule, ButtonModule, InputTextModule, TagModule],
  templateUrl: './index-empleado.component.html',
  styleUrl: './index-empleado.component.css',
})
export class IndexEmpleadoComponent {
  private readonly service = inject(TerceroService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly rows = signal<TerceroTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  /** Id del tipo_tercero EMPLEADO (resuelto por código, no hardcodeado). */
  private readonly empleadoTipoId = signal<number | null>(null);

  /** Resuelve (una vez) el id del tipo_tercero con código EMPLEADO para filtrar el listado. */
  private async ensureEmpleadoTipo(): Promise<number | null> {
    if (this.empleadoTipoId() != null) return this.empleadoTipoId();
    try {
      const res = await lastValueFrom(this.catalogoService.list('tipo-tercero', { page: 0, rows: 500 }));
      const emp = res.data.content.find((t) => t.codigo === 'EMPLEADO');
      this.empleadoTipoId.set(emp?.id ?? null);
    } catch {
      this.empleadoTipoId.set(null);
    }
    return this.empleadoTipoId();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const tipoTerceroId = await this.ensureEmpleadoTipo();
      const res = await lastValueFrom(
        this.service.list({
          page: this.page(),
          rows: this.pageSize(),
          search: this.search || null,
          params: { tipoTerceroId },
        }),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar el listado de empleados');
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

  hojaVida(row: TerceroTableModel): void {
    void this.router.navigate(['/empleados', row.id, 'hoja-vida']);
  }
}
