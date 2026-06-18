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
import { CuentaBancariaService } from '../services/cuenta-bancaria.service';
import { CuentaBancariaModel, CuentaBancariaTableModel } from '../models/cuenta-bancaria.model';
import { FormCuentaBancariaComponent } from '../form/form-cuenta-bancaria.component';

@Component({
  selector: 'app-index-cuenta-bancaria',
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
    FormCuentaBancariaComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-cuenta-bancaria.component.html',
  styleUrl: './index-cuenta-bancaria.component.css',
})
export class IndexCuentaBancariaComponent {
  private readonly service = inject(CuentaBancariaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<CuentaBancariaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<CuentaBancariaModel | null>(null);

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
      this.alert.error('No se pudo cargar el listado de cuentas bancarias');
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
  async editar(row: CuentaBancariaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la cuenta bancaria');
    }
  }
  onSaved(): void {
    this.load();
  }

  eliminar(row: CuentaBancariaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la cuenta ${row.numeroCuenta}?`,
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
      this.alert.success('Cuenta bancaria eliminada');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo eliminar la cuenta bancaria'));
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
