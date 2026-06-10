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
import { LoteService } from '../services/lote.service';
import { LoteModel } from '../models/lote.model';

@Component({
  selector: 'app-form-lote',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule],
  templateUrl: './form-lote.component.html',
  styleUrl: './form-lote.component.css',
})
export class FormLoteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(LoteService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<LoteModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    productoVarianteId: this.fb.control<number | null>(null),
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(40)]),
    nombre: this.fb.control<string | null>(null),
    fechaFabricado: this.fb.control<string | null>(null),
    fechaVencimiento: this.fb.control<string | null>(null),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          productoVarianteId: r?.productoVarianteId ?? null,
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? null,
          fechaFabricado: r?.fechaFabricado ?? null,
          fechaVencimiento: r?.fechaVencimiento ?? null,
        });
      }
    });
  }

  isInvalid(field: 'codigo'): boolean {
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
      this.alert.success('Lote guardado');
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
    return 'No se pudo guardar el lote';
  }
}
