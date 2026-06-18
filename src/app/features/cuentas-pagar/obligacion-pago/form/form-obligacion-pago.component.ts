import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { ObligacionPagoService } from '../services/obligacion-pago.service';
import { CreateObligacionPagoRetencionDto } from '../models/obligacion-pago.model';
import { ImpuestoService } from '../../../comun/impuesto/services/impuesto.service';
import { ImpuestoTableModel } from '../../../comun/impuesto/models/impuesto.model';

interface RetencionUI {
  _id: number;
  impuestoId: number | null;
  base: number | null;
  valor: number | null;
}

@Component({
  selector: 'app-form-obligacion-pago',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, DecimalPipe, ButtonModule, InputTextModule, InputNumberModule, SelectModule, TerceroSelectorComponent],
  templateUrl: './form-obligacion-pago.component.html',
  styleUrl: './form-obligacion-pago.component.css',
})
export class FormObligacionPagoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ObligacionPagoService);
  private readonly impuestoService = inject(ImpuestoService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly impuestos = signal<ImpuestoTableModel[]>([]);

  readonly showSelector = signal(false);
  readonly proveedorNombre = signal<string | null>(null);

  private seq = 0;
  readonly retenciones = signal<RetencionUI[]>([]);
  readonly totalRetenciones = computed(() =>
    this.retenciones().reduce((acc, r) => acc + (r.valor ?? 0), 0),
  );
  readonly saldoPreview = computed(() => (this.frm.controls.valorTotal.value ?? 0) - this.totalRetenciones());

  readonly frm = this.fb.group({
    proveedorId: this.fb.control<number | null>(null, [Validators.required]),
    facturaProveedorId: this.fb.control<number | null>(null),
    numero: this.fb.control<string | null>(null),
    fecha: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [Validators.required]),
    fechaVencimiento: this.fb.control<string | null>(null),
    valorTotal: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  constructor() {
    void this.cargarImpuestos();
  }

  private async cargarImpuestos(): Promise<void> {
    try {
      const res = await lastValueFrom(this.impuestoService.list({ page: 0, rows: 5000 }));
      this.impuestos.set(res.data.content);
    } catch {
      /* ignore */
    }
  }

  openSelector(): void {
    this.showSelector.set(true);
  }
  onProveedorSelected(t: TerceroTableModel): void {
    this.frm.controls.proveedorId.setValue(t.id);
    this.proveedorNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }

  agregar(): void {
    this.retenciones.update((arr) => [...arr, { _id: ++this.seq, impuestoId: null, base: null, valor: null }]);
  }
  quitar(id: number): void {
    this.retenciones.update((arr) => arr.filter((r) => r._id !== id));
  }

  volver(): void {
    void this.router.navigate(['/obligaciones']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Completa proveedor, fecha y valor total');
      return;
    }
    const retenciones: CreateObligacionPagoRetencionDto[] = this.retenciones()
      .filter((r) => r.impuestoId != null && (r.valor ?? 0) > 0)
      .map((r) => ({ impuestoId: r.impuestoId, base: r.base, limite: null, valor: r.valor }));
    if (this.totalRetenciones() > (this.frm.controls.valorTotal.value ?? 0)) {
      this.alert.error('Las retenciones superan el valor total');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      await lastValueFrom(this.service.create({ ...v, cuentaId: null, retenciones }));
      this.alert.success('Obligación de pago creada');
      this.volver();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.loading.set(false);
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo guardar la obligación';
  }
}
