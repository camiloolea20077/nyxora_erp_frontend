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
import { ComprobanteService } from '../services/comprobante.service';
import { ComprobanteTableModel } from '../models/comprobante.model';

type TagSeverity = 'success' | 'warn' | 'secondary' | 'danger';

@Component({
  selector: 'app-index-comprobante',
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
  templateUrl: './index-comprobante.component.html',
  styleUrl: './index-comprobante.component.css',
})
export class IndexComprobanteComponent {
  private readonly service = inject(ComprobanteService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<ComprobanteTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'confirmado') return 'success';
    if (estado === 'borrador') return 'warn';
    if (estado === 'reversado') return 'danger';
    return 'secondary';
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
      this.alert.error('No se pudo cargar el listado de comprobantes');
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
    void this.router.navigate(['/comprobantes/nuevo']);
  }
  ver(row: ComprobanteTableModel): void {
    void this.router.navigate(['/comprobantes', row.id]);
  }

  async confirmar(row: ComprobanteTableModel): Promise<void> {
    try {
      await lastValueFrom(this.service.confirmar(row.id));
      this.alert.success('Comprobante confirmado');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo confirmar'));
    }
  }
  reversar(row: ComprobanteTableModel): void {
    this.confirm.confirm({
      message: `¿Reversar el comprobante ${row.numero ?? row.id}?`,
      header: 'Confirmar reversa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Reversar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doReversar(row.id),
    });
  }
  private async doReversar(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.reversar(id));
      this.alert.success('Comprobante reversado');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo reversar'));
    }
  }

  eliminar(row: ComprobanteTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar el comprobante ${row.numero ?? row.id}?`,
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
      this.alert.success('Comprobante eliminado');
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
