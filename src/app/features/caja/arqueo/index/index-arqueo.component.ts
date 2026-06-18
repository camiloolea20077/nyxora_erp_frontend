import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

import { AlertService } from '../../../../shared/services/alert.service';
import { ArqueoService } from '../services/arqueo.service';
import { ArqueoTableModel } from '../models/arqueo.model';
import { CajaService } from '../../caja/services/caja.service';
import { CajaTableModel } from '../../caja/models/caja.model';

@Component({
  selector: 'app-index-arqueo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule, DialogModule],
  templateUrl: './index-arqueo.component.html',
  styleUrl: './index-arqueo.component.css',
})
export class IndexArqueoComponent {
  private readonly service = inject(ArqueoService);
  private readonly cajaService = inject(CajaService);
  private readonly alert = inject(AlertService);

  readonly rows = signal<ArqueoTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  readonly cajas = signal<CajaTableModel[]>([]);
  readonly showForm = signal(false);
  readonly guardando = signal(false);
  cajaId: number | null = null;
  valorDeclarado: number | null = null;
  observaciones: string | null = null;

  constructor() {
    void this.cargarCajas();
  }

  private async cargarCajas(): Promise<void> {
    try {
      const res = await lastValueFrom(this.cajaService.list({ page: 0, rows: 5000 }));
      this.cajas.set(res.data.content);
    } catch {
      /* ignore */
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.list({ page: this.page(), rows: this.pageSize() }));
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar los arqueos');
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
    this.cajaId = null;
    this.valorDeclarado = null;
    this.observaciones = null;
    this.showForm.set(true);
  }

  async guardar(): Promise<void> {
    if (this.cajaId == null || this.valorDeclarado == null) {
      this.alert.error('Selecciona la caja y el valor declarado');
      return;
    }
    this.guardando.set(true);
    try {
      const res = await lastValueFrom(
        this.service.create({ cajaId: this.cajaId, valorDeclarado: this.valorDeclarado, observaciones: this.observaciones }),
      );
      const dif = res.data.diferencia ?? 0;
      this.alert.success(`Arqueo registrado. Diferencia: ${new Intl.NumberFormat('es-CO').format(dif)}`);
      this.showForm.set(false);
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.guardando.set(false);
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo registrar el arqueo';
  }
}
