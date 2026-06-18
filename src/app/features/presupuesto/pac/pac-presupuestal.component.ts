import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

import { AlertService } from '../../../shared/services/alert.service';
import { PacService } from './services/pac.service';
import { PacPresupuestalModel } from './models/pac.model';
import { RubroPresupuestalService } from '../rubro/services/rubro.service';
import { RubroPresupuestalTableModel } from '../rubro/models/rubro.model';
import { nombreMes } from '../../contabilidad/periodo/meses';

interface MesOpt {
  label: string;
  value: number;
}

@Component({
  selector: 'app-pac-presupuestal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, TableModule, ButtonModule, InputNumberModule, SelectModule, DialogModule],
  templateUrl: './pac-presupuestal.component.html',
  styleUrl: './pac-presupuestal.component.css',
})
export class PacPresupuestalComponent {
  private readonly service = inject(PacService);
  private readonly rubroService = inject(RubroPresupuestalService);
  private readonly alert = inject(AlertService);

  readonly rubros = signal<RubroPresupuestalTableModel[]>([]);
  rubroId: number | null = null;
  anio: number | null = new Date().getFullYear();

  readonly rows = signal<PacPresupuestalModel[]>([]);
  readonly cargando = signal(false);
  readonly totalPac = computed(() => this.rows().reduce((acc, r) => acc + (r.valor ?? 0), 0));

  readonly meses: MesOpt[] = Array.from({ length: 12 }, (_, i) => ({ label: nombreMes(i + 1), value: i + 1 }));

  readonly showForm = signal(false);
  readonly guardando = signal(false);
  mes: number | null = 1;
  valor: number | null = null;

  mesNombre(m: number): string {
    return nombreMes(m);
  }

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
      const res = await lastValueFrom(this.service.list(this.rubroId, this.anio));
      this.rows.set(res.data);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo consultar el PAC');
    } finally {
      this.cargando.set(false);
    }
  }

  nuevo(): void {
    this.mes = 1;
    this.valor = null;
    this.showForm.set(true);
  }

  async guardar(): Promise<void> {
    if (this.rubroId == null || this.anio == null || this.mes == null || this.valor == null) {
      this.alert.error('Completa mes y valor');
      return;
    }
    this.guardando.set(true);
    try {
      await lastValueFrom(this.service.upsert({
        rubroPresupuestalId: this.rubroId,
        anio: this.anio,
        mes: this.mes,
        valor: this.valor,
      }));
      this.alert.success('PAC registrado');
      this.showForm.set(false);
      void this.consultar();
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
    return 'No se pudo registrar el PAC';
  }
}
