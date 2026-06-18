import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../shared/services/alert.service';
import { PeriodoService } from '../../contabilidad/periodo/services/periodo.service';
import { PeriodoTableModel } from '../../contabilidad/periodo/models/periodo.model';
import { ReporteService } from '../services/reporte.service';
import { BalanceGeneral } from '../models/reporte.model';

interface PeriodoOpt {
  id: number;
  label: string;
}

@Component({
  selector: 'app-balance-general',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, SelectModule, TagModule],
  templateUrl: './balance-general.component.html',
  styleUrl: './balance-general.component.css',
})
export class BalanceGeneralComponent implements OnInit {
  private readonly service = inject(ReporteService);
  private readonly periodoService = inject(PeriodoService);
  private readonly alert = inject(AlertService);

  readonly periodos = signal<PeriodoOpt[]>([]);
  readonly data = signal<BalanceGeneral | null>(null);
  readonly loading = signal(false);
  periodoId: number | null = null;

  ngOnInit(): void {
    void this.cargarPeriodos();
  }

  private async cargarPeriodos(): Promise<void> {
    try {
      const res = await lastValueFrom(this.periodoService.list({ page: 0, rows: 1000 }));
      this.periodos.set(
        res.data.content.map((p: PeriodoTableModel) => ({ id: p.id, label: `${p.anio}-${p.mes} · ${p.estado}` })),
      );
    } catch {
      this.periodos.set([]);
    }
  }

  async generar(): Promise<void> {
    if (this.periodoId == null) {
      this.alert.error('Selecciona un periodo');
      return;
    }
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.balanceGeneral(this.periodoId));
      this.data.set(res.data);
    } catch {
      this.data.set(null);
      this.alert.error('No se pudo generar el balance');
    } finally {
      this.loading.set(false);
    }
  }
}
