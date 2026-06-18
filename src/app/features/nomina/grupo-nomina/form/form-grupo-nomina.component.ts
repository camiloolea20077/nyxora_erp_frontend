import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { GrupoNominaService } from '../services/grupo-nomina.service';
import { GrupoNominaModel } from '../models/grupo-nomina.model';

@Component({
  selector: 'app-form-grupo-nomina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './form-grupo-nomina.component.html',
  styleUrl: './form-grupo-nomina.component.css',
})
export class FormGrupoNominaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(GrupoNominaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<GrupoNominaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frecuencias = [
    { label: 'Mensual', value: 'mensual' },
    { label: 'Quincenal', value: 'quincenal' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Catorcenal', value: 'catorcenal' },
  ];

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    frecuenciaPago: this.fb.control<string | null>(null),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          frecuenciaPago: r?.frecuenciaPago ?? null,
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
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.create(v));
      }
      this.alert.success('Grupo guardado');
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
    return 'No se pudo guardar el grupo';
  }
}
