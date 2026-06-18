import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { CajaService } from '../services/caja.service';
import { CajaModel, CajaTableModel } from '../models/caja.model';
import { FormCajaComponent } from '../form/form-caja.component';

@Component({
  selector: 'app-index-caja',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ConfirmDialogModule,
    FormCajaComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-caja.component.html',
  styleUrl: './index-caja.component.css',
})
export class IndexCajaComponent {
  private readonly service = inject(CajaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<CajaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<CajaModel | null>(null);

  readonly showAbrir = signal(false);
  readonly abriendo = signal(false);
  private abrirId: number | null = null;
  saldoInicial: number | null = 0;

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
      this.alert.error('No se pudo cargar el listado de cajas');
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
  async editar(row: CajaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la caja');
    }
  }
  onSaved(): void {
    this.load();
  }

  abrirDialog(row: CajaTableModel): void {
    this.abrirId = row.id;
    this.saldoInicial = 0;
    this.showAbrir.set(true);
  }
  async confirmarAbrir(): Promise<void> {
    if (this.abrirId == null) return;
    this.abriendo.set(true);
    try {
      await lastValueFrom(this.service.abrir(this.abrirId, { saldoInicial: this.saldoInicial }));
      this.alert.success('Caja abierta');
      this.showAbrir.set(false);
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo abrir la caja'));
    } finally {
      this.abriendo.set(false);
    }
  }

  cerrar(row: CajaTableModel): void {
    this.confirm.confirm({
      message: `¿Cerrar la caja ${row.codigo}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cerrar',
      rejectLabel: 'Cancelar',
      accept: () => void this.doCerrar(row.id),
    });
  }
  private async doCerrar(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.cerrar(id));
      this.alert.success('Caja cerrada');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo cerrar la caja'));
    }
  }

  eliminar(row: CajaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la caja ${row.codigo}?`,
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
      this.alert.success('Caja eliminada');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo eliminar la caja'));
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
