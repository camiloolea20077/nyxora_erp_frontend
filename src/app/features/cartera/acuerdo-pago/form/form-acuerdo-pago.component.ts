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
import { AcuerdoPagoService } from '../services/acuerdo-pago.service';
import { CreateAcuerdoPagoCuotaDto } from '../models/acuerdo-pago.model';
import { CuentaCobrarService } from '../../cuenta-cobrar/services/cuenta-cobrar.service';
import { CuentaPorCobrarTableModel } from '../../cuenta-cobrar/models/cuenta-cobrar.model';

interface CuotaUI {
  _id: number;
  valor: number | null;
  fechaAplicacion: string | null;
}

interface CxcOpt {
  id: number;
  label: string;
  saldo: number;
}

@Component({
  selector: 'app-form-acuerdo-pago',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, DecimalPipe, ButtonModule, InputTextModule, InputNumberModule, SelectModule],
  templateUrl: './form-acuerdo-pago.component.html',
  styleUrl: './form-acuerdo-pago.component.css',
})
export class FormAcuerdoPagoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AcuerdoPagoService);
  private readonly cxcService = inject(CuentaCobrarService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly cuentas = signal<CxcOpt[]>([]);

  private seq = 0;
  readonly cuotas = signal<CuotaUI[]>([]);
  readonly sumaCuotas = computed(() =>
    this.cuotas().reduce((acc, c) => acc + (c.valor ?? 0), 0),
  );

  readonly frm = this.fb.group({
    cuentaPorCobrarId: this.fb.control<number | null>(null, [Validators.required]),
    fecha: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [Validators.required]),
  });

  constructor() {
    void this.cargarCxc();
    this.agregar();
  }

  saldoSeleccionado = computed(() => {
    const id = this.frm.controls.cuentaPorCobrarId.value;
    return this.cuentas().find((c) => c.id === id)?.saldo ?? 0;
  });

  private async cargarCxc(): Promise<void> {
    try {
      const res = await lastValueFrom(this.cxcService.list({ page: 0, rows: 5000 }));
      this.cuentas.set(
        res.data.content
          .filter((c: CuentaPorCobrarTableModel) => c.estado === 'vigente')
          .map((c) => ({ id: c.id, saldo: c.saldo ?? 0, label: `#${c.id} · saldo ${formatNum(c.saldo)}` })),
      );
    } catch {
      this.alert.error('No se pudieron cargar las cuentas por cobrar');
    }
  }

  agregar(): void {
    this.cuotas.update((arr) => [...arr, { _id: ++this.seq, valor: null, fechaAplicacion: null }]);
  }
  quitar(id: number): void {
    this.cuotas.update((arr) => arr.filter((c) => c._id !== id));
  }

  volver(): void {
    void this.router.navigate(['/acuerdos-pago']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Selecciona la cuenta por cobrar y la fecha');
      return;
    }
    const cuotas: CreateAcuerdoPagoCuotaDto[] = this.cuotas()
      .filter((c) => (c.valor ?? 0) > 0)
      .map((c) => ({ valor: c.valor, fechaAplicacion: c.fechaAplicacion }));
    if (cuotas.length === 0) {
      this.alert.error('Agrega al menos una cuota con valor');
      return;
    }
    if (this.sumaCuotas() > this.saldoSeleccionado()) {
      this.alert.error('La suma de las cuotas supera el saldo de la cuenta por cobrar');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      await lastValueFrom(this.service.create({ ...v, cuotas }));
      this.alert.success('Acuerdo de pago creado');
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
    return 'No se pudo guardar el acuerdo';
  }
}

function formatNum(v: number | null): string {
  return new Intl.NumberFormat('es-CO').format(v ?? 0);
}
