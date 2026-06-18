import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { FacturaService } from '../services/factura.service';
import { FacturaTableModel } from '../models/factura.model';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';

type TagSeverity = 'success' | 'warn' | 'secondary' | 'danger' | 'info';

@Component({
  selector: 'app-index-factura',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-factura.component.html',
  styleUrl: './index-factura.component.css',
})
export class IndexFacturaComponent {
  private readonly service = inject(FacturaService);
  private readonly terceroService = inject(TerceroService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<FacturaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';
  private readonly clientes = signal<Map<number, string>>(new Map());

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'emitida') return 'success';
    if (estado === 'borrador') return 'warn';
    if (estado === 'anulada') return 'danger';
    return 'secondary';
  }
  cliente(id: number | null): string {
    if (id == null) return '';
    return this.clientes().get(id) ?? `#${id}`;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(
        this.service.list({
          page: this.page(),
          rows: this.pageSize(),
          search: this.search || null,
        }),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
      void this.resolverClientes(res.data.content.map((r) => r.clienteId));
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar el listado de facturas');
    } finally {
      this.loading.set(false);
    }
  }

  private async resolverClientes(ids: (number | null)[]): Promise<void> {
    const map = new Map(this.clientes());
    const pend = [...new Set(ids.filter((i): i is number => i != null))].filter((i) => !map.has(i));
    await Promise.all(
      pend.map(async (id) => {
        try {
          const res = await lastValueFrom(this.terceroService.getById(id));
          map.set(id, res.data.nombre ?? `#${id}`);
        } catch {
          /* ignore */
        }
      }),
    );
    this.clientes.set(map);
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
    void this.router.navigate(['/facturas/nuevo']);
  }
  ver(row: FacturaTableModel): void {
    void this.router.navigate(['/facturas', row.id]);
  }
  editar(row: FacturaTableModel): void {
    void this.router.navigate(['/facturas', row.id, 'editar']);
  }

  anular(row: FacturaTableModel): void {
    this.confirm.confirm({
      message: `¿Anular la factura ${row.numero ?? row.id}? Se reversará el inventario si estaba emitida.`,
      header: 'Confirmar',
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
      this.alert.success('Factura anulada');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo anular'));
    }
  }

  eliminar(row: FacturaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la factura ${row.numero ?? row.id}?`,
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
      this.alert.error(this.msg(e, 'No se pudo eliminar'));
    }
  }

  private msg(e: unknown, fallback: string): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return fallback;
  }
}
