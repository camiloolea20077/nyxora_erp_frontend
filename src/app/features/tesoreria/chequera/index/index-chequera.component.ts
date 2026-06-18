import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { CuentaBancariaService } from '../../cuenta-bancaria/services/cuenta-bancaria.service';
import { ChequeraService } from '../services/chequera.service';
import { ChequeraModel, ChequeraTableModel } from '../models/chequera.model';
import { FormChequeraComponent } from '../form/form-chequera.component';

@Component({
  selector: 'app-index-chequera',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    FormChequeraComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-chequera.component.html',
  styleUrl: './index-chequera.component.css',
})
export class IndexChequeraComponent {
  private readonly service = inject(ChequeraService);
  private readonly cuentaBancariaService = inject(CuentaBancariaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<ChequeraTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  readonly showForm = signal(false);
  readonly editing = signal<ChequeraModel | null>(null);

  private readonly cuentas = signal<Map<number, string>>(new Map());

  constructor() {
    void this.cargarCuentas();
  }

  private async cargarCuentas(): Promise<void> {
    try {
      const res = await lastValueFrom(this.cuentaBancariaService.list({ page: 0, rows: 5000 }));
      const map = new Map<number, string>();
      res.data.content.forEach((c) => map.set(c.id, c.numeroCuenta));
      this.cuentas.set(map);
    } catch {
      /* ignore */
    }
  }
  cuenta(id: number | null): string {
    if (id == null) return '—';
    return this.cuentas().get(id) ?? `#${id}`;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.list({ page: this.page(), rows: this.pageSize() }));
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar el listado de chequeras');
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
    this.editing.set(null);
    this.showForm.set(true);
  }
  async editar(row: ChequeraTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la chequera');
    }
  }
  onSaved(): void {
    this.load();
  }

  eliminar(row: ChequeraTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la chequera #${row.id}?`,
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
      this.alert.success('Chequera eliminada');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo eliminar la chequera'));
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
