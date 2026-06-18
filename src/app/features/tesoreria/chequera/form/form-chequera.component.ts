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
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { CuentaBancariaService } from '../../cuenta-bancaria/services/cuenta-bancaria.service';
import { CuentaBancariaTableModel } from '../../cuenta-bancaria/models/cuenta-bancaria.model';
import { ChequeraService } from '../services/chequera.service';
import { ChequeraModel } from '../models/chequera.model';

@Component({
  selector: 'app-form-chequera',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
  ],
  templateUrl: './form-chequera.component.html',
  styleUrl: './form-chequera.component.css',
})
export class FormChequeraComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ChequeraService);
  private readonly cuentaBancariaService = inject(CuentaBancariaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ChequeraModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly cuentas = signal<CuentaBancariaTableModel[]>([]);

  readonly frm = this.fb.group({
    cuentaBancariaId: this.fb.control<number | null>(null, [Validators.required]),
    fechaExpedicion: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [
      Validators.required,
    ]),
    numeroInicial: this.fb.control<number | null>(null, [Validators.required]),
    numeroFinal: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor() {
    void this.cargarCuentas();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          cuentaBancariaId: r?.cuentaBancariaId ?? null,
          fechaExpedicion: r?.fechaExpedicion ?? new Date().toISOString().slice(0, 10),
          numeroInicial: r?.numeroInicial ?? null,
          numeroFinal: r?.numeroFinal ?? null,
        });
      }
    });
  }

  private async cargarCuentas(): Promise<void> {
    try {
      const res = await lastValueFrom(this.cuentaBancariaService.list({ page: 0, rows: 5000 }));
      this.cuentas.set(res.data.content);
    } catch {
      this.alert.error('No se pudieron cargar las cuentas bancarias');
    }
  }

  isInvalid(field: 'cuentaBancariaId' | 'fechaExpedicion' | 'numeroInicial' | 'numeroFinal'): boolean {
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
      this.alert.success('Chequera guardada');
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
    return 'No se pudo guardar la chequera';
  }
}
