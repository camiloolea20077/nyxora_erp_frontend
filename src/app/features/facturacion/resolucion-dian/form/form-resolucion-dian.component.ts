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

import { AlertService } from '../../../../shared/services/alert.service';
import { ResolucionDianService } from '../services/resolucion-dian.service';
import { ResolucionDianModel } from '../models/resolucion-dian.model';

@Component({
  selector: 'app-form-resolucion-dian',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule],
  templateUrl: './form-resolucion-dian.component.html',
  styleUrl: './form-resolucion-dian.component.css',
})
export class FormResolucionDianComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ResolucionDianService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ResolucionDianModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    numeroResolucion: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(20),
    ]),
    prefijo: this.fb.control<string | null>(null),
    facturaInicial: this.fb.control<number | null>(null),
    facturaFinal: this.fb.control<number | null>(null),
    fechaInicial: this.fb.control<string | null>(null),
    fechaFinal: this.fb.control<string | null>(null),
    claveTecnica: this.fb.control<string | null>(null),
    descripcion: this.fb.control<string | null>(null),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          numeroResolucion: r?.numeroResolucion ?? '',
          prefijo: r?.prefijo ?? null,
          facturaInicial: r?.facturaInicial ?? null,
          facturaFinal: r?.facturaFinal ?? null,
          fechaInicial: r?.fechaInicial ?? null,
          fechaFinal: r?.fechaFinal ?? null,
          claveTecnica: r?.claveTecnica ?? null,
          descripcion: r?.descripcion ?? null,
        });
      }
    });
  }

  isInvalid(field: 'numeroResolucion'): boolean {
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
      this.alert.success('Resolución guardada');
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
    return 'No se pudo guardar la resolución';
  }
}
