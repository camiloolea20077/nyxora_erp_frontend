import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { ProgramaService } from '../services/programa.service';
import { ProgramaModel } from '../models/programa.model';

@Component({
  selector: 'app-form-programa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './form-programa.component.html',
  styleUrl: './form-programa.component.css',
})
export class FormProgramaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProgramaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ProgramaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    codigo: this.fb.control<string | null>(null),
    nombre: this.fb.nonNullable.control('', [Validators.required]),
    tipoPrograma: this.fb.control<string | null>(null),
    modalidad: this.fb.control<string | null>(null),
    registroAcademico: this.fb.control<string | null>(null),
    descripcion: this.fb.control<string | null>(null),
  });

  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      codigo: r?.codigo ?? null,
      nombre: r?.nombre ?? '',
      tipoPrograma: r?.tipoPrograma ?? null,
      modalidad: r?.modalidad ?? null,
      registroAcademico: r?.registroAcademico ?? null,
      descripcion: r?.descripcion ?? null,
    });
  }

  isInvalid(field: 'nombre'): boolean {
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
      const payload = {
        ...v,
        centroCostoProgramaId: r?.centroCostoProgramaId ?? null,
        centroCostoFacultadId: r?.centroCostoFacultadId ?? null,
      };
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...payload }));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.alert.success('Programa guardado');
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
    return 'No se pudo guardar el programa';
  }
}
