import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { SaldoService } from '../services/saldo.service';
import { SaldoModel } from '../models/saldo.model';
import { PeriodoService } from '../../periodo/services/periodo.service';
import { PeriodoTableModel } from '../../periodo/models/periodo.model';
import { nombreMes } from '../../periodo/meses';
import { CuentaService } from '../../cuenta/services/cuenta.service';

@Component({
  selector: 'app-index-saldo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, SelectModule],
  templateUrl: './index-saldo.component.html',
  styleUrl: './index-saldo.component.css',
})
export class IndexSaldoComponent {
  private readonly service = inject(SaldoService);
  private readonly periodoService = inject(PeriodoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly alert = inject(AlertService);

  readonly periodos = signal<PeriodoTableModel[]>([]);
  private readonly cuentasMap = signal<Map<number, string>>(new Map());
  readonly saldos = signal<SaldoModel[]>([]);
  readonly loading = signal(false);
  readonly recalculando = signal(false);

  periodoId: number | null = null;

  readonly periodoOpts = computed(() =>
    this.periodos().map((p) => ({ id: p.id, label: `${p.anio} · ${nombreMes(p.mes)}` })),
  );

  constructor() {
    void this.cargar();
  }

  nombreCuenta(id: number): string {
    return this.cuentasMap().get(id) ?? `#${id}`;
  }

  private async cargar(): Promise<void> {
    try {
      const [per, cue] = await Promise.all([
        lastValueFrom(this.periodoService.list({ page: 0, rows: 500 })),
        lastValueFrom(this.cuentaService.list({ page: 0, rows: 5000 })),
      ]);
      this.periodos.set(per.data.content);
      this.cuentasMap.set(new Map(cue.data.content.map((c) => [c.id, `${c.codigoCuenta} · ${c.nombreCuenta}`])));
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  async consultar(): Promise<void> {
    if (this.periodoId == null) {
      this.alert.error('Selecciona un periodo');
      return;
    }
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.consultar(this.periodoId));
      this.saldos.set(res.data);
    } catch {
      this.saldos.set([]);
      this.alert.error('No se pudieron consultar los saldos');
    } finally {
      this.loading.set(false);
    }
  }

  async recalcular(): Promise<void> {
    if (this.periodoId == null) {
      this.alert.error('Selecciona un periodo');
      return;
    }
    this.recalculando.set(true);
    try {
      const res = await lastValueFrom(this.service.recalcular(this.periodoId));
      this.alert.success(`Saldos recalculados (${res.data} cuentas)`);
      await this.consultar();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.recalculando.set(false);
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudieron recalcular los saldos';
  }
}
