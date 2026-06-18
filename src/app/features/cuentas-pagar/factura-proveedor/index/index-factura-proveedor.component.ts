import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { FacturaProveedorService } from '../services/factura-proveedor.service';
import { FacturaProveedorTableModel } from '../models/factura-proveedor.model';

type TagSeverity = 'success' | 'warn' | 'secondary' | 'danger';

@Component({
  selector: 'app-index-factura-proveedor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, TableModule, ButtonModule, TagModule, TooltipModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-factura-proveedor.component.html',
  styleUrl: './index-factura-proveedor.component.css',
})
export class IndexFacturaProveedorComponent {
  private readonly service = inject(FacturaProveedorService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<FacturaProveedorTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'aceptada') return 'success';
    if (estado === 'recibida') return 'warn';
    if (estado === 'rechazada') return 'danger';
    return 'secondary';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(
        this.service.list({ page: this.page(), rows: this.pageSize() }),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar las facturas de proveedor');
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

  nuevo(): void {
    void this.router.navigate(['/facturas-proveedor/nuevo']);
  }
  ver(row: FacturaProveedorTableModel): void {
    void this.router.navigate(['/facturas-proveedor', row.id]);
  }
  eliminar(row: FacturaProveedorTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la factura ${row.numeroDocumento ?? row.id}?`,
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
      this.alert.success('Factura eliminada');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    }
  }
  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo eliminar';
  }
}
