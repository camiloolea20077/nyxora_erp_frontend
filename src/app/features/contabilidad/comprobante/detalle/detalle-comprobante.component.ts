import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { AlertService } from '../../../../shared/services/alert.service';
import { ComprobanteService } from '../services/comprobante.service';
import { ComprobanteModel } from '../models/comprobante.model';
import { CuentaService } from '../../cuenta/services/cuenta.service';

@Component({
  selector: 'app-detalle-comprobante',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ButtonModule, TagModule],
  templateUrl: './detalle-comprobante.component.html',
  styleUrl: './detalle-comprobante.component.css',
})
export class DetalleComprobanteComponent {
  private readonly service = inject(ComprobanteService);
  private readonly cuentaService = inject(CuentaService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly comprobante = signal<ComprobanteModel | null>(null);
  readonly loading = signal(false);
  private readonly cuentasMap = signal<Map<number, string>>(new Map());

  readonly estado = computed(() => this.comprobante()?.estado ?? '');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
  }

  nombreCuenta(id: number | null): string {
    if (id == null) return '';
    return this.cuentasMap().get(id) ?? `#${id}`;
  }

  private async cargar(id: number): Promise<void> {
    this.loading.set(true);
    try {
      const [comp, cuentas] = await Promise.all([
        lastValueFrom(this.service.getById(id)),
        lastValueFrom(this.cuentaService.list({ page: 0, rows: 5000 })),
      ]);
      this.comprobante.set(comp.data);
      this.cuentasMap.set(new Map(cuentas.data.content.map((c) => [c.id, `${c.codigoCuenta} · ${c.nombreCuenta}`])));
    } catch {
      this.alert.error('No se pudo cargar el comprobante');
      this.volver();
    } finally {
      this.loading.set(false);
    }
  }

  volver(): void {
    void this.router.navigate(['/comprobantes']);
  }

  async confirmar(): Promise<void> {
    const c = this.comprobante();
    if (!c) return;
    try {
      await lastValueFrom(this.service.confirmar(c.id));
      this.alert.success('Comprobante confirmado');
      void this.cargar(c.id);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo confirmar'));
    }
  }
  async reversar(): Promise<void> {
    const c = this.comprobante();
    if (!c) return;
    try {
      await lastValueFrom(this.service.reversar(c.id));
      this.alert.success('Comprobante reversado');
      void this.cargar(c.id);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo reversar'));
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
