import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { EgresoService } from '../services/egreso.service';
import { ComprobanteEgresoModel } from '../models/egreso.model';
import { CuentaService } from '../../../contabilidad/cuenta/services/cuenta.service';
import { CuentaTableModel } from '../../../contabilidad/cuenta/models/cuenta.model';
import { PeriodoService } from '../../../contabilidad/periodo/services/periodo.service';
import { PeriodoTableModel } from '../../../contabilidad/periodo/models/periodo.model';
import { nombreMes } from '../../../contabilidad/periodo/meses';

@Component({
  selector: 'app-detalle-egreso',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, ButtonModule, TagModule, DialogModule, SelectModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalle-egreso.component.html',
  styleUrl: './detalle-egreso.component.css',
})
export class DetalleEgresoComponent {
  private readonly service = inject(EgresoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly periodoService = inject(PeriodoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly egreso = signal<ComprobanteEgresoModel | null>(null);
  readonly cuentas = signal<CuentaTableModel[]>([]);
  readonly periodos = signal<PeriodoTableModel[]>([]);
  readonly periodoOpts = computed(() =>
    this.periodos().map((p) => ({ id: p.id, label: `${p.anio} · ${nombreMes(p.mes)}` })),
  );

  readonly showGirar = signal(false);
  readonly girando = signal(false);
  cuentaBancoId: number | null = null;
  cuentaCxpId: number | null = null;
  periodoContableId: number | null = null;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
    void this.cargarCatalogos();
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

  private async cargar(id: number): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(id));
      this.egreso.set(res.data);
    } catch {
      this.alert.error('No se pudo cargar el egreso');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/egresos']);
  }

  abrirGirar(): void {
    this.cuentaBancoId = null;
    this.cuentaCxpId = null;
    this.periodoContableId = null;
    this.showGirar.set(true);
  }
  async girar(): Promise<void> {
    const e = this.egreso();
    if (!e) return;
    this.girando.set(true);
    try {
      await lastValueFrom(this.service.girar(e.id, {
        cuentaBancoId: this.cuentaBancoId,
        cuentaCxpId: this.cuentaCxpId,
        periodoContableId: this.periodoContableId,
      }));
      this.alert.success('Egreso girado');
      this.showGirar.set(false);
      void this.cargar(e.id);
    } catch (err: unknown) {
      this.alert.error(this.msg(err, 'No se pudo girar el egreso'));
    } finally {
      this.girando.set(false);
    }
  }

  anular(): void {
    const e = this.egreso();
    if (!e) return;
    this.confirm.confirm({
      message: '¿Anular el egreso? Se reversa la aplicación a la obligación si estaba girado.',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doAnular(e.id),
    });
  }
  private async doAnular(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.anular(id));
      this.alert.success('Egreso anulado');
      void this.cargar(id);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo anular'));
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
