import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { RecepcionService } from '../services/recepcion.service';
import { RecepcionTableModel } from '../models/recepcion.model';
import { CuentaService } from '../../../contabilidad/cuenta/services/cuenta.service';
import { CuentaTableModel } from '../../../contabilidad/cuenta/models/cuenta.model';
import { PeriodoService } from '../../../contabilidad/periodo/services/periodo.service';
import { PeriodoTableModel } from '../../../contabilidad/periodo/models/periodo.model';
import { nombreMes } from '../../../contabilidad/periodo/meses';

type TagSeverity = 'success' | 'warn' | 'secondary';

@Component({
  selector: 'app-index-recepcion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TableModule, ButtonModule, TagModule, TooltipModule, DialogModule, SelectModule],
  templateUrl: './index-recepcion.component.html',
  styleUrl: './index-recepcion.component.css',
})
export class IndexRecepcionComponent {
  private readonly service = inject(RecepcionService);
  private readonly cuentaService = inject(CuentaService);
  private readonly periodoService = inject(PeriodoService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly rows = signal<RecepcionTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  readonly cuentas = signal<CuentaTableModel[]>([]);
  readonly periodos = signal<PeriodoTableModel[]>([]);
  readonly periodoOpts = computed(() =>
    this.periodos().map((p) => ({ id: p.id, label: `${p.anio} · ${nombreMes(p.mes)}` })),
  );

  readonly showConfirm = signal(false);
  readonly confirmando = signal(false);
  private confirmId: number | null = null;
  cuentaInventarioId: number | null = null;
  cuentaContrapartidaId: number | null = null;
  periodoContableId: number | null = null;

  constructor() {
    void this.cargarCatalogos();
  }

  estadoSeverity(estado: string): TagSeverity {
    if (estado === 'confirmada') return 'success';
    if (estado === 'borrador') return 'warn';
    return 'secondary';
  }

  private async cargarCatalogos(): Promise<void> {
    try {
      const [cue, per] = await Promise.all([
        lastValueFrom(this.cuentaService.list({ page: 0, rows: 5000 })),
        lastValueFrom(this.periodoService.list({ page: 0, rows: 500 })),
      ]);
      this.cuentas.set(cue.data.content);
      this.periodos.set(per.data.content);
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
      this.alert.error('No se pudo cargar el listado de recepciones');
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
    void this.router.navigate(['/recepciones/nuevo']);
  }
  ver(row: RecepcionTableModel): void {
    void this.router.navigate(['/recepciones', row.id]);
  }

  abrirConfirmar(row: RecepcionTableModel): void {
    this.confirmId = row.id;
    this.cuentaInventarioId = null;
    this.cuentaContrapartidaId = null;
    this.periodoContableId = null;
    this.showConfirm.set(true);
  }

  async confirmar(): Promise<void> {
    if (this.confirmId == null) return;
    if (this.cuentaInventarioId == null || this.cuentaContrapartidaId == null || this.periodoContableId == null) {
      this.alert.error('Selecciona las cuentas y el periodo');
      return;
    }
    this.confirmando.set(true);
    try {
      await lastValueFrom(
        this.service.confirmar(this.confirmId, {
          cuentaInventarioId: this.cuentaInventarioId,
          cuentaContrapartidaId: this.cuentaContrapartidaId,
          periodoContableId: this.periodoContableId,
        }),
      );
      this.alert.success('Recepción confirmada (inventario + asiento)');
      this.showConfirm.set(false);
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.confirmando.set(false);
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo confirmar la recepción';
  }
}
