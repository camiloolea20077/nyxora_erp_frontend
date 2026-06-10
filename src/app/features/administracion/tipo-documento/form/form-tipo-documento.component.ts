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
import { CheckboxModule } from 'primeng/checkbox';

import { AlertService } from '../../../../shared/services/alert.service';
import { TipoDocumentoService } from '../services/tipo-documento.service';
import { TipoDocumentoModel } from '../models/tipo-documento.model';

@Component({
  selector: 'app-form-tipo-documento',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, CheckboxModule],
  templateUrl: './form-tipo-documento.component.html',
  styleUrl: './form-tipo-documento.component.css',
})
export class FormTipoDocumentoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TipoDocumentoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<TipoDocumentoModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    modulo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    prefijo: this.fb.control<string | null>(null),
    reiniciaPorVigencia: this.fb.nonNullable.control(false),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          modulo: r?.modulo ?? '',
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          prefijo: r?.prefijo ?? null,
          reiniciaPorVigencia: r?.reiniciaPorVigencia ?? false,
        });
      }
    });
  }

  isInvalid(field: 'modulo' | 'codigo' | 'nombre'): boolean {
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
      this.alert.success('Tipo de documento guardado');
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
    return 'No se pudo guardar el tipo de documento';
  }
}
