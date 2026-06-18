import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../shared/services/alert.service';
import { PeriodoService } from '../../contabilidad/periodo/services/periodo.service';
import { PeriodoTableModel } from '../../contabilidad/periodo/models/periodo.model';
import { ReporteService } from '../services/reporte.service';
import { CierrePeriodoResult } from '../models/reporte.model';

interface PeriodoOpt {
  id: number;
  label: string;
  estado: string;
}

@Component({
  selector: 'app-cierre-periodo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonModule, SelectModule, TagModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './cierre-periodo.component.html',
  styleUrl: './cierre-periodo.component.css',
})
export class CierrePeriodoComponent implements OnInit {
  private readonly service = inject(ReporteService);
  private readonly periodoService = inject(PeriodoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly periodos = signal<PeriodoOpt[]>([]);
  readonly resultado = signal<CierrePeriodoResult | null>(null);
  readonly working = signal(false);
  periodoId: number | null = null;

  ngOnInit(): void {
    void this.cargarPeriodos();
  }

  private async cargarPeriodos(): Promise<void> {
    try {
      const res = await lastValueFrom(this.periodoService.list({ page: 0, rows: 1000 }));
      this.periodos.set(
        res.data.content.map((p: PeriodoTableModel) => ({
          id: p.id,
          label: `${p.anio}-${p.mes} · ${p.estado}`,
          estado: p.estado,
        })),
      );
    } catch {
      this.periodos.set([]);
    }
  }

  confirmar(): void {
    if (this.periodoId == null) {
      this.alert.error('Selecciona un periodo');
      return;
    }
    this.confirm.confirm({
      message: 'Se validarán los borradores, se recalcularán los saldos y se cerrará el periodo. ¿Continuar?',
      header: 'Cerrar periodo',
      icon: 'pi pi-lock',
      acceptLabel: 'Cerrar',
      rejectLabel: 'Cancelar',
      accept: () => void this.cerrar(),
    });
  }

  private async cerrar(): Promise<void> {
    if (this.periodoId == null) return;
    this.working.set(true);
    this.resultado.set(null);
    try {
      const res = await lastValueFrom(this.service.cerrarPeriodo(this.periodoId));
      this.resultado.set(res.data);
      this.alert.success('Periodo cerrado');
      this.cargarPeriodos();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.working.set(false);
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo cerrar el periodo';
  }
}
