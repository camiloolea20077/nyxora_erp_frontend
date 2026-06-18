import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { ConceptoNominaService } from '../../concepto-nomina/services/concepto-nomina.service';
import { CuentaService } from '../../../contabilidad/cuenta/services/cuenta.service';
import { PeriodoService } from '../../../contabilidad/periodo/services/periodo.service';
import { LiquidacionNominaService } from '../services/liquidacion-nomina.service';
import {
  AportePila,
  LiquidacionDetalle,
  LiquidacionNominaModel,
} from '../models/liquidacion-nomina.model';

interface Opcion {
  id: number;
  label: string;
}

const SEVERIDAD: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
  abierto: 'info',
  liquidado: 'warn',
  revisado: 'warn',
  contabilizado: 'success',
  cerrado: 'secondary',
  anulado: 'danger',
};

@Component({
  selector: 'app-detalle-liquidacion-nomina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    DecimalPipe,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    SelectModule,
    TabsModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalle-liquidacion-nomina.component.html',
  styleUrl: './detalle-liquidacion-nomina.component.css',
})
export class DetalleLiquidacionNominaComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(LiquidacionNominaService);
  private readonly conceptoService = inject(ConceptoNominaService);
  private readonly cuentaService = inject(CuentaService);
  private readonly periodoService = inject(PeriodoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly id = signal<number>(0);
  readonly liq = signal<LiquidacionNominaModel | null>(null);
  readonly detalle = signal<LiquidacionDetalle[]>([]);
  readonly pila = signal<AportePila[]>([]);
  readonly loading = signal(false);
  readonly working = signal(false);

  readonly estado = computed(() => this.liq()?.estado ?? '');
  readonly puedeLiquidar = computed(() => this.estado() === 'abierto');
  readonly puedeContabilizar = computed(() => this.estado() === 'liquidado' || this.estado() === 'revisado');
  readonly puedeAnular = computed(() => !['cerrado', 'anulado'].includes(this.estado()));

  // Catálogos para los diálogos
  readonly conceptosDevengado = signal<Opcion[]>([]);
  readonly cuentas = signal<Opcion[]>([]);
  readonly periodos = signal<Opcion[]>([]);

  // Diálogo liquidar
  readonly showLiquidar = signal(false);
  conceptoSueldoId: number | null = null;

  // Diálogo contabilizar
  readonly showContabilizar = signal(false);
  periodoContableId: number | null = null;
  cuentaGastoId: number | null = null;
  cuentaPorPagarId: number | null = null;
  cuentaDeduccionesId: number | null = null;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.id.set(id);
    void this.cargar();
    void this.cargarCatalogos();
  }

  severidad(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return SEVERIDAD[estado] ?? 'info';
  }

  volver(): void {
    void this.router.navigate(['/liquidaciones']);
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    try {
      const [l, d, p] = await Promise.all([
        lastValueFrom(this.service.getById(this.id())),
        lastValueFrom(this.service.listDetalle(this.id())),
        lastValueFrom(this.service.listPila(this.id())),
      ]);
      this.liq.set(l.data);
      this.detalle.set(d.data);
      this.pila.set(p.data);
    } catch {
      this.alert.error('No se pudo cargar la liquidación');
      this.volver();
    } finally {
      this.loading.set(false);
    }
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 1000 };
    try {
      const [con, cue, per] = await Promise.all([
        lastValueFrom(this.conceptoService.list(req, 'devengado')),
        lastValueFrom(this.cuentaService.list(req)),
        lastValueFrom(this.periodoService.list(req)),
      ]);
      this.conceptosDevengado.set(con.data.content.map((c) => ({ id: c.id, label: `${c.codigo} - ${c.nombre}` })));
      this.cuentas.set(cue.data.content.map((c) => ({ id: c.id, label: `${c.codigoCuenta} - ${c.nombreCuenta}` })));
      this.periodos.set(per.data.content.map((p) => ({ id: p.id, label: `${p.anio}-${p.mes}` })));
    } catch {
      /* catálogos opcionales */
    }
  }

  // ---------- Liquidar ----------
  abrirLiquidar(): void {
    this.conceptoSueldoId = null;
    this.showLiquidar.set(true);
  }
  async confirmarLiquidar(): Promise<void> {
    this.working.set(true);
    try {
      await lastValueFrom(this.service.liquidar(this.id(), { conceptoSueldoId: this.conceptoSueldoId }));
      this.alert.success('Nómina liquidada');
      this.showLiquidar.set(false);
      this.cargar();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo liquidar'));
    } finally {
      this.working.set(false);
    }
  }

  // ---------- Contabilizar ----------
  abrirContabilizar(): void {
    this.periodoContableId = null;
    this.cuentaGastoId = null;
    this.cuentaPorPagarId = null;
    this.cuentaDeduccionesId = null;
    this.showContabilizar.set(true);
  }
  async confirmarContabilizar(): Promise<void> {
    if (this.periodoContableId == null || this.cuentaGastoId == null || this.cuentaPorPagarId == null) {
      this.alert.error('Periodo, cuenta de gasto y cuenta por pagar son obligatorios');
      return;
    }
    this.working.set(true);
    try {
      await lastValueFrom(
        this.service.contabilizar(this.id(), {
          periodoContableId: this.periodoContableId,
          cuentaGastoId: this.cuentaGastoId,
          cuentaPorPagarId: this.cuentaPorPagarId,
          cuentaDeduccionesId: this.cuentaDeduccionesId,
        }),
      );
      this.alert.success('Nómina contabilizada');
      this.showContabilizar.set(false);
      this.cargar();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo contabilizar'));
    } finally {
      this.working.set(false);
    }
  }

  // ---------- Anular ----------
  anular(): void {
    this.confirm.confirm({
      message: '¿Anular esta liquidación?',
      header: 'Confirmar anulación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doAnular(),
    });
  }
  private async doAnular(): Promise<void> {
    this.working.set(true);
    try {
      await lastValueFrom(this.service.anular(this.id()));
      this.alert.success('Liquidación anulada');
      this.cargar();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo anular'));
    } finally {
      this.working.set(false);
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
