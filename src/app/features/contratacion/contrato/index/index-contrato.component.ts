import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { ContratoService } from '../services/contrato.service';
import { ContratoTableModel } from '../models/contrato.model';
import { ESTADO_CONTRATO_SEVERITY } from '../estado-contrato';

@Component({
  selector: 'app-index-contrato',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-contrato.component.html',
  styleUrl: './index-contrato.component.css',
})
export class IndexContratoComponent {
  private readonly service = inject(ContratoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly rows = signal<ContratoTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  estadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return ESTADO_CONTRATO_SEVERITY[estado] ?? 'secondary';
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
      this.alert.error('No se pudieron cargar los contratos');
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
    void this.router.navigate(['/contratos', 'nuevo']);
  }
  ver(row: ContratoTableModel): void {
    void this.router.navigate(['/contratos', row.id]);
  }
  editar(row: ContratoTableModel): void {
    void this.router.navigate(['/contratos', row.id, 'editar']);
  }
  eliminar(row: ContratoTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar el contrato "${row.nombre}"?`,
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
      this.alert.success('Contrato eliminado');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar el contrato');
    }
  }
}
