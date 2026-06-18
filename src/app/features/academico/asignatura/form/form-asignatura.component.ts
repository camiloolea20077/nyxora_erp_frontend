import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { AsignaturaService } from '../services/asignatura.service';
import { AsignaturaModel } from '../models/asignatura.model';

@Component({
  selector: 'app-form-asignatura',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './form-asignatura.component.html',
  styleUrl: './form-asignatura.component.css',
})
export class FormAsignaturaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AsignaturaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<AsignaturaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required]),
    nombre: this.fb.nonNullable.control('', [Validators.required]),
    descripcion: this.fb.control<string | null>(null),
  });

  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      codigo: r?.codigo ?? '',
      nombre: r?.nombre ?? '',
      descripcion: r?.descripcion ?? null,
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
      const payload = { ...v, centroCostoDepartamentoId: r?.centroCostoDepartamentoId ?? null };
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...payload }));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.alert.success('Asignatura guardada');
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
    return 'No se pudo guardar la asignatura';
  }
}
