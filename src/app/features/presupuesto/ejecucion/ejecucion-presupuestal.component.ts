import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

import { AlertService } from '../../../shared/services/alert.service';
import { EjecucionPresupuestalService } from './services/ejecucion-presupuestal.service';
import { AfectacionPresupuestalTableModel, SaldoPresupuestalModel } from './models/ejecucion.model';
import { RubroPresupuestalService } from '../rubro/services/rubro.service';
import { RubroPresupuestalTableModel } from '../rubro/models/rubro.model';

interface TipoOpt {
  label: string;
  value: string;
}

@Component({
  selector: 'app-ejecucion-presupuestal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, InputNumberModule, InputTextModule, SelectModule, TagModule, DialogModule],
  templateUrl: './ejecucion-presupuestal.component.html',
  styleUrl: './ejecucion-presupuestal.component.css',
})
export class EjecucionPresupuestalComponent {
  private readonly service = inject(EjecucionPresupuestalService);
  private readonly rubroService = inject(RubroPresupuestalService);
  private readonly alert = inject(AlertService);

  readonly rubros = signal<RubroPresupuestalTableModel[]>([]);
  rubroId: number | null = null;
  anio: number | null = new Date().getFullYear();

  readonly saldo = signal<SaldoPresupuestalModel | null>(null);
  readonly afectaciones = signal<AfectacionPresupuestalTableModel[]>([]);
  readonly cargando = signal(false);

  readonly tipos: TipoOpt[] = [
    { label: 'Disponibilidad (CDP)', value: 'disponibilidad' },
    { label: 'Compromiso', value: 'compromiso' },
    { label: 'Obligación', value: 'obligacion' },
    { label: 'Pago', value: 'pago' },
    { label: 'Reconocimiento', value: 'reconocimiento' },
    { label: 'Recaudo', value: 'recaudo' },
  ];

  // apropiar dialog
  readonly showApropiar = signal(false);
  readonly apropiando = signal(false);
  apPlanInicial: number | null = null;
  apAdiciones: number | null = null;
  apReducciones: number | null = null;
  apCreditos: number | null = null;
  apContraCreditos: number | null = null;
  apAplazamientos: number | null = null;

  // afectación dialog
  readonly showAfectacion = signal(false);
  readonly registrando = signal(false);
  afTipo: string | null = 'disponibilidad';
  afValor: number | null = null;
  afDescripcion: string | null = null;

  constructor() {
    void this.cargarRubros();
  }

  private async cargarRubros(): Promise<void> {
    try {
      const res = await lastValueFrom(this.rubroService.list({ page: 0, rows: 5000 }));
      this.rubros.set(res.data.content);
    } catch {
      /* ignore */
    }
  }

  async consultar(): Promise<void> {
    if (this.rubroId == null || this.anio == null) {
      this.alert.error('Selecciona el rubro y el año');
      return;
    }
    this.cargando.set(true);
    try {
      const [saldoRes, afRes] = await Promise.all([
        lastValueFrom(this.service.saldo(this.rubroId, this.anio)).catch(() => null),
        lastValueFrom(this.service.listAfectaciones(this.rubroId, { page: 0, rows: 100 })),
      ]);
      this.saldo.set(saldoRes ? saldoRes.data : null);
      this.afectaciones.set(afRes.data.content);
    } catch {
      this.alert.error('No se pudo consultar la ejecución');
    } finally {
      this.cargando.set(false);
    }
  }

  // ── apropiar ──
  abrirApropiar(): void {
    const s = this.saldo();
    this.apPlanInicial = s?.planInicial ?? null;
    this.apAdiciones = s?.adiciones ?? null;
    this.apReducciones = s?.reducciones ?? null;
    this.apCreditos = s?.creditos ?? null;
    this.apContraCreditos = s?.contraCreditos ?? null;
    this.apAplazamientos = s?.aplazamientos ?? null;
    this.showApropiar.set(true);
  }
  async apropiar(): Promise<void> {
    if (this.rubroId == null || this.anio == null) return;
    this.apropiando.set(true);
    try {
      await lastValueFrom(this.service.apropiar({
        rubroPresupuestalId: this.rubroId,
        anio: this.anio,
        planInicial: this.apPlanInicial,
        adiciones: this.apAdiciones,
        reducciones: this.apReducciones,
        aplazamientos: this.apAplazamientos,
        creditos: this.apCreditos,
        contraCreditos: this.apContraCreditos,
      }));
      this.alert.success('Apropiación registrada');
      this.showApropiar.set(false);
      void this.consultar();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo apropiar'));
    } finally {
      this.apropiando.set(false);
    }
  }

  // ── afectación ──
  abrirAfectacion(): void {
    this.afTipo = 'disponibilidad';
    this.afValor = null;
    this.afDescripcion = null;
    this.showAfectacion.set(true);
  }
  async registrarAfectacion(): Promise<void> {
    if (this.rubroId == null || this.afTipo == null || this.afValor == null) {
      this.alert.error('Completa el tipo y el valor');
      return;
    }
    this.registrando.set(true);
    try {
      await lastValueFrom(this.service.registrarAfectacion({
        rubroPresupuestalId: this.rubroId,
        tipoOperacion: this.afTipo,
        terceroId: null,
        centroCostoId: null,
        proyectoId: null,
        fuenteFinanciamientoId: null,
        cpcId: null,
        descripcion: this.afDescripcion,
        valor: this.afValor,
      }));
      this.alert.success('Afectación registrada');
      this.showAfectacion.set(false);
      await this.recalcular();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo registrar la afectación'));
    } finally {
      this.registrando.set(false);
    }
  }

  async recalcular(): Promise<void> {
    if (this.rubroId == null || this.anio == null) return;
    try {
      await lastValueFrom(this.service.recalcular(this.rubroId, this.anio));
      void this.consultar();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo recalcular'));
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
