import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

import { AlertService } from '../../../../shared/services/alert.service';
import { FacturaProveedorService } from '../services/factura-proveedor.service';
import { FacturaProveedorModel } from '../models/factura-proveedor.model';

interface EstadoOpt {
  label: string;
  value: string;
}

@Component({
  selector: 'app-detalle-factura-proveedor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    TagModule,
    DialogModule,
    SelectModule,
    InputTextModule,
  ],
  templateUrl: './detalle-factura-proveedor.component.html',
  styleUrl: './detalle-factura-proveedor.component.css',
})
export class DetalleFacturaProveedorComponent {
  private readonly service = inject(FacturaProveedorService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly factura = signal<FacturaProveedorModel | null>(null);

  readonly estadoOpts: EstadoOpt[] = [
    { label: 'Aceptada', value: 'aceptada' },
    { label: 'Rechazada', value: 'rechazada' },
    { label: 'Recibida', value: 'recibida' },
  ];

  readonly showEvento = signal(false);
  readonly guardando = signal(false);
  evento: string | null = null;
  fechaEvento: string | null = null;
  cudeEvento: string | null = null;
  conceptoReclamo: string | null = null;
  descripcionReclamo: string | null = null;
  estadoEvento: string | null = null;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar(id);
  }

  private async cargar(id: number): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(id));
      this.factura.set(res.data);
    } catch {
      this.alert.error('No se pudo cargar la factura');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/facturas-proveedor']);
  }

  abrirEvento(): void {
    this.evento = null;
    this.fechaEvento = new Date().toISOString().slice(0, 10);
    this.cudeEvento = null;
    this.conceptoReclamo = null;
    this.descripcionReclamo = null;
    this.estadoEvento = null;
    this.showEvento.set(true);
  }
  async guardarEvento(): Promise<void> {
    const f = this.factura();
    if (!f) return;
    this.guardando.set(true);
    try {
      await lastValueFrom(
        this.service.registrarEvento(f.id, {
          evento: this.evento,
          fechaEvento: this.fechaEvento,
          cudeEvento: this.cudeEvento,
          conceptoReclamo: this.conceptoReclamo,
          descripcionReclamo: this.descripcionReclamo,
          estado: this.estadoEvento,
        }),
      );
      this.alert.success('Evento registrado');
      this.showEvento.set(false);
      void this.cargar(f.id);
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
    return 'No se pudo registrar el evento';
  }
}
