import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AlertService } from '../../../../shared/services/alert.service';
import { ClasificacionFaltaService } from '../services/clasificacion-falta.service';
import { ClasificacionFaltaModel } from '../models/clasificacion-falta.model';

@Component({
  selector: 'app-form-clasificacion-falta',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './form-clasificacion-falta.component.html',
  styleUrl: './form-clasificacion-falta.component.css',
})
export class FormClasificacionFaltaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClasificacionFaltaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ClasificacionFaltaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required]),
    nombre: this.fb.nonNullable.control('', [Validators.required]),
  });

  onShow(): void {
    const r = this.registro();
    this.frm.reset({ codigo: r?.codigo ?? '', nombre: r?.nombre ?? '' });
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
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.create(v));
      }
      this.alert.success('Clasificación guardada');
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
    return 'No se pudo guardar la clasificación';
  }
}
