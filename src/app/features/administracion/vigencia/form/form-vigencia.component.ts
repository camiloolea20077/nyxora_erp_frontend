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
import { InputNumberModule } from 'primeng/inputnumber';

import { AlertService } from '../../../../shared/services/alert.service';
import { VigenciaService } from '../services/vigencia.service';
import { VigenciaModel } from '../models/vigencia.model';

@Component({
  selector: 'app-form-vigencia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputNumberModule],
  templateUrl: './form-vigencia.component.html',
  styleUrl: './form-vigencia.component.css',
})
export class FormVigenciaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(VigenciaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<VigenciaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.nonNullable.group({
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({ year: r?.year ?? new Date().getFullYear() });
      }
    });
  }

  get invalidYear(): boolean {
    const c = this.frm.controls.year;
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
      const value = this.frm.getRawValue();
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...value }));
      } else {
        await lastValueFrom(this.service.create(value));
      }
      this.alert.success('Vigencia guardada');
      this.saved.emit();
      this.close();
    } catch (e: unknown) {
      this.alert.error(this.extractMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  private extractMessage(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo guardar la vigencia';
  }
}
