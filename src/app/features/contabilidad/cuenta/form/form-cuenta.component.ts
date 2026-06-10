import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

import { AlertService } from '../../../../shared/services/alert.service';
import { CuentaService } from '../services/cuenta.service';
import { CuentaModel, CuentaTableModel } from '../models/cuenta.model';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form-cuenta',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, CheckboxModule],
  templateUrl: './form-cuenta.component.html',
  styleUrl: './form-cuenta.component.css',
})
export class FormCuentaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CuentaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<CuentaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly cuentas = signal<CuentaTableModel[]>([]);
  readonly isEdit = computed(() => !!this.registro());

  readonly naturalezas: Opcion[] = [
    { label: 'Débito', value: 'debito' },
    { label: 'Crédito', value: 'credito' },
  ];
  readonly tipos: Opcion[] = [
    { label: 'Clase', value: 'clase' },
    { label: 'Grupo', value: 'grupo' },
    { label: 'Cuenta', value: 'cuenta' },
    { label: 'Subcuenta', value: 'subcuenta' },
    { label: 'Auxiliar', value: 'auxiliar' },
  ];

  readonly frm = this.fb.group({
    cuentaPadreId: this.fb.control<number | null>(null),
    codigoCuenta: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombreCuenta: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
    naturaleza: this.fb.control<string | null>('debito'),
    tipoCuenta: this.fb.control<string | null>('auxiliar'),
    manejaMovimiento: this.fb.nonNullable.control(true),
    manejaMovimientoManual: this.fb.nonNullable.control(true),
    manejaTercero: this.fb.nonNullable.control(false),
    manejaCentroCosto: this.fb.nonNullable.control(false),
    manejaImpuesto: this.fb.nonNullable.control(false),
    manejaProyecto: this.fb.nonNullable.control(false),
    manejaRecurso: this.fb.nonNullable.control(false),
    manejaSaldoContrario: this.fb.nonNullable.control(false),
    esCorriente: this.fb.nonNullable.control(false),
  });

  constructor() {
    void this.cargar();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          cuentaPadreId: r?.cuentaPadreId ?? null,
          codigoCuenta: r?.codigoCuenta ?? '',
          nombreCuenta: r?.nombreCuenta ?? '',
          naturaleza: r?.naturaleza ?? 'debito',
          tipoCuenta: r?.tipoCuenta ?? 'auxiliar',
          manejaMovimiento: r?.manejaMovimiento ?? true,
          manejaMovimientoManual: r?.manejaMovimientoManual ?? true,
          manejaTercero: r?.manejaTercero ?? false,
          manejaCentroCosto: r?.manejaCentroCosto ?? false,
          manejaImpuesto: r?.manejaImpuesto ?? false,
          manejaProyecto: r?.manejaProyecto ?? false,
          manejaRecurso: r?.manejaRecurso ?? false,
          manejaSaldoContrario: r?.manejaSaldoContrario ?? false,
          esCorriente: r?.esCorriente ?? false,
        });
      }
    });
  }

  private async cargar(): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.list({ page: 0, rows: 5000 }));
      this.cuentas.set(res.data.content);
    } catch {
      this.cuentas.set([]);
    }
  }

  isInvalid(field: 'codigoCuenta' | 'nombreCuenta'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }
  close(): void {
    this.visible.set(false);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...v }));
      } else {
        await lastValueFrom(this.service.create(v));
      }
      this.alert.success('Cuenta guardada');
      this.saved.emit();
      this.close();
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
    return 'No se pudo guardar la cuenta';
  }
}
