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

import { AlertService } from '../../../../shared/services/alert.service';
import { ParametroService } from '../services/parametro.service';
import { ParametroModel } from '../models/parametro.model';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form-parametro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './form-parametro.component.html',
  styleUrl: './form-parametro.component.css',
})
export class FormParametroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ParametroService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ParametroModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly tipos: Opcion[] = [
    { label: 'Texto', value: 'string' },
    { label: 'Número', value: 'number' },
    { label: 'Booleano', value: 'boolean' },
    { label: 'Fecha', value: 'date' },
  ];

  readonly frm = this.fb.nonNullable.group({
    key: ['', [Validators.required, Validators.maxLength(100)]],
    value: ['', [Validators.required]],
    dataType: ['string', [Validators.required]],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({ key: r?.key ?? '', value: r?.value ?? '', dataType: r?.dataType ?? 'string' });
        if (r) {
          this.frm.controls.key.disable();
        } else {
          this.frm.controls.key.enable();
        }
      }
    });
  }

  isInvalid(field: 'key' | 'value' | 'dataType'): boolean {
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
      const value = this.frm.getRawValue();
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...value }));
      } else {
        await lastValueFrom(this.service.create(value));
      }
      this.alert.success('Parámetro guardado');
      this.saved.emit();
      this.close();
    } catch (e: unknown) {
      this.alert.error(this.extractMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  private extractMessage(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo guardar el parámetro';
  }
}
