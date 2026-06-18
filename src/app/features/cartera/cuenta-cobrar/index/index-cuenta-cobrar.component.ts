import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../../shared/services/alert.service';
import { CuentaCobrarService } from '../services/cuenta-cobrar.service';
import { CuentaPorCobrarTableModel } from '../models/cuenta-cobrar.model';
import { FormCuentaCobrarComponent } from '../form/form-cuenta-cobrar.component';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';

type TagSeverity = 'success' | 'warn' | 'secondary' | 'danger' | 'info';

@Component({
  selector: 'app-index-cuenta-cobrar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, FormCuentaCobrarComponent],
  templateUrl: './index-cuenta-cobrar.component.html',
  styleUrl: './index-cuenta-cobrar.component.css',
})
export class IndexCuentaCobrarComponent {
  private readonly service = inject(CuentaCobrarService);
  private readonly terceroService = inject(TerceroService);
  private readonly alert = inject(AlertService);

  readonly rows = signal<CuentaPorCobrarTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';
  readonly showForm = signal(false);
  private readonly clientes = signal<Map<number, string>>(new Map());

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'pagada') return 'success';
    if (estado === 'vigente') return 'warn';
    if (estado === 'en_acuerdo') return 'info';
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
        this.service.list({ page: this.page(), rows: this.pageSize(), search: this.search || null }),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
      void this.resolverClientes(res.data.content.map((r) => r.clienteId));
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar la cartera');
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
    this.showForm.set(true);
  }
  onSaved(): void {
    this.load();
  }
}
