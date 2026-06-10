import { ChangeDetectionStrategy, Component, effect, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';

import { AlertService } from '../../../../shared/services/alert.service';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { BodegaService } from '../services/bodega.service';
import { BodegaResponsableModel } from '../models/bodega.model';

@Component({
  selector: 'app-responsables-bodega',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DialogModule, ButtonModule, TableModule, TagModule, CheckboxModule, TerceroSelectorComponent],
  templateUrl: './responsables-bodega.component.html',
  styleUrl: './responsables-bodega.component.css',
})
export class ResponsablesBodegaComponent {
  private readonly service = inject(BodegaService);
  private readonly terceroService = inject(TerceroService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly bodegaId = input<number | null>(null);
  readonly bodegaNombre = input('');

  readonly items = signal<BodegaResponsableModel[]>([]);
  readonly loading = signal(false);
  readonly showSelector = signal(false);
  private readonly nombres = signal<Map<number, string>>(new Map());
  predeterminado = false;

  constructor() {
    effect(() => {
      if (this.visible() && this.bodegaId() != null) {
        void this.load();
      }
    });
  }

  nombreTercero(id: number): string {
    return this.nombres().get(id) ?? `Tercero #${id}`;
  }

  async load(): Promise<void> {
    const bid = this.bodegaId();
    if (bid == null) return;
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listResponsables(bid));
      this.items.set(res.data);
      void this.resolverNombres(res.data.map((r) => r.terceroId));
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async resolverNombres(ids: number[]): Promise<void> {
    const map = new Map(this.nombres());
    const pendientes = [...new Set(ids)].filter((id) => !map.has(id));
    await Promise.all(
      pendientes.map(async (id) => {
        try {
          const res = await lastValueFrom(this.terceroService.getById(id));
          map.set(id, res.data.nombre ?? `Tercero #${id}`);
        } catch {
          /* deja el #id si falla */
        }
      }),
    );
    this.nombres.set(map);
  }

  abrirSelector(): void {
    this.showSelector.set(true);
  }

  async onTerceroSelected(t: TerceroTableModel): Promise<void> {
    const bid = this.bodegaId();
    if (bid == null) return;
    try {
      await lastValueFrom(this.service.createResponsable(bid, { terceroId: t.id, predeterminado: this.predeterminado }));
      this.nombres.update((m) => new Map(m).set(t.id, `${t.nombre} · ${t.numeroDocumento}`));
      this.predeterminado = false;
      this.alert.success('Responsable asignado');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    }
  }

  async eliminar(row: BodegaResponsableModel): Promise<void> {
    const bid = this.bodegaId();
    if (bid == null) return;
    try {
      await lastValueFrom(this.service.deleteResponsable(bid, row.id));
      this.alert.success('Responsable removido');
      this.load();
    } catch {
      this.alert.error('No se pudo remover el responsable');
    }
  }

  close(): void {
    this.visible.set(false);
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo asignar el responsable';
  }
}
