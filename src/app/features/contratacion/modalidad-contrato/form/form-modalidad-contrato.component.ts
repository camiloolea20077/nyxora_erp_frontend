import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { ModalidadContratoService } from '../services/modalidad-contrato.service';
import { ModalidadContratoModel } from '../models/modalidad-contrato.model';

@Component({
  selector: 'app-form-modalidad-contrato',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './form-modalidad-contrato.component.html',
  styleUrl: './form-modalidad-contrato.component.css',
})
export class FormModalidadContratoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ModalidadContratoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ModalidadContratoModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    descripcion: this.fb.control<string | null>(null),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          descripcion: r?.descripcion ?? null,
        });
      }
    });
  }

  isInvalid(field: 'codigo' | 'nombre'): boolean {
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
      this.alert.success('Modalidad guardada');
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
    return 'No se pudo guardar la modalidad';
  }
}
