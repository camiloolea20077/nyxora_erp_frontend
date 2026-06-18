import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../shared/services/alert.service';
import { VigenciaService } from '../../administracion/vigencia/services/vigencia.service';
import { VigenciaTableModel } from '../../administracion/vigencia/models/vigencia.model';
import { ReporteService } from '../services/reporte.service';
import { EjecucionRubro } from '../models/reporte.model';

interface VigenciaOpt {
  id: number;
  label: string;
}

@Component({
  selector: 'app-ejecucion-presupuestal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, SelectModule, TagModule],
  templateUrl: './ejecucion-presupuestal.component.html',
  styleUrl: './ejecucion-presupuestal.component.css',
})
export class EjecucionPresupuestalComponent implements OnInit {
  private readonly service = inject(ReporteService);
  private readonly vigenciaService = inject(VigenciaService);
  private readonly alert = inject(AlertService);

  readonly vigencias = signal<VigenciaOpt[]>([]);
  readonly rows = signal<EjecucionRubro[]>([]);
  readonly loading = signal(false);
  vigenciaId: number | null = null;

  ngOnInit(): void {
    void this.cargarVigencias();
  }

  private async cargarVigencias(): Promise<void> {
    try {
      const res = await lastValueFrom(this.vigenciaService.list({ page: 0, rows: 500 }));
      this.vigencias.set(res.data.content.map((v: VigenciaTableModel) => ({ id: v.id, label: `${v.year} · ${v.status}` })));
    } catch {
      this.vigencias.set([]);
    }
  }

  async generar(): Promise<void> {
    if (this.vigenciaId == null) {
      this.alert.error('Selecciona una vigencia');
      return;
    }
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.ejecucionPresupuestal(this.vigenciaId));
      this.rows.set(res.data);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo generar la ejecución presupuestal');
    } finally {
      this.loading.set(false);
    }
  }
}
