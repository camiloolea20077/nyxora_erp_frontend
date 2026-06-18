import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { ClasificacionFaltaService } from '../../clasificacion-falta/services/clasificacion-falta.service';
import { ClasificacionFaltaTableModel } from '../../clasificacion-falta/models/clasificacion-falta.model';
import { FaltaService } from '../services/falta.service';
import { FaltaModel } from '../models/falta.model';

@Component({
  selector: 'app-form-falta',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule, TextareaModule],
  templateUrl: './form-falta.component.html',
  styleUrl: './form-falta.component.css',
})
export class FormFaltaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FaltaService);
  private readonly clasificacionService = inject(ClasificacionFaltaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<FaltaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());
  readonly clasificaciones = signal<ClasificacionFaltaTableModel[]>([]);

  readonly frm = this.fb.group({
    clasificacionFaltaId: this.fb.control<number | null>(null),
    codigo: this.fb.nonNullable.control('', [Validators.required]),
    nombre: this.fb.nonNullable.control('', [Validators.required]),
    caducidadDias: this.fb.control<number | null>(null),
    descripcion: this.fb.control<string | null>(null),
    politica: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargarClasificaciones();
  }

  private async cargarClasificaciones(): Promise<void> {
    try {
      const res = await lastValueFrom(this.clasificacionService.list({ page: 0, rows: 500 }));
      this.clasificaciones.set(res.data.content);
    } catch {
      this.clasificaciones.set([]);
    }
  }

  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      clasificacionFaltaId: r?.clasificacionFaltaId ?? null,
      codigo: r?.codigo ?? '',
      nombre: r?.nombre ?? '',
      caducidadDias: r?.caducidadDias ?? null,
      descripcion: r?.descripcion ?? null,
      politica: r?.politica ?? null,
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
      this.alert.success('Falta guardada');
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
    return 'No se pudo guardar la falta';
  }
}
