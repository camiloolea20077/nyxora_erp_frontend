import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { AlertService } from '../../../shared/services/alert.service';
import { ReporteService } from '../services/reporte.service';
import { CarteraTercero } from '../models/reporte.model';

@Component({
  selector: 'app-cartera',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, TableModule, ButtonModule],
  templateUrl: './cartera.component.html',
  styleUrl: './cartera.component.css',
})
export class CarteraComponent implements OnInit {
  private readonly service = inject(ReporteService);
  private readonly alert = inject(AlertService);

  readonly rows = signal<CarteraTercero[]>([]);
  readonly loading = signal(false);

  readonly totalSaldo = computed(() => this.rows().reduce((a, r) => a + (r.saldoTotal ?? 0), 0));
  readonly totalVencido = computed(() => this.rows().reduce((a, r) => a + (r.saldoVencido ?? 0), 0));

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.cartera());
      this.rows.set(res.data);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar la cartera');
    } finally {
      this.loading.set(false);
    }
  }
}
