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

import { AlertService } from '../../../../shared/services/alert.service';
import { FuenteFinanciamientoService } from '../services/fuente-financiamiento.service';
import { FuenteFinanciamientoModel } from '../models/fuente-financiamiento.model';

@Component({
  selector: 'app-form-fuente-financiamiento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './form-fuente-financiamiento.component.html',
  styleUrl: './form-fuente-financiamiento.component.css',
})
export class FormFuenteFinanciamientoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FuenteFinanciamientoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<FuenteFinanciamientoModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(45)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    descripcion: this.fb.control<string | null>(null),
    tipoRecurso: this.fb.control<string | null>(null),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          descripcion: r?.descripcion ?? null,
          tipoRecurso: r?.tipoRecurso ?? null,
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
      this.alert.success('Fuente guardada');
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
    return 'No se pudo guardar la fuente';
  }
}
