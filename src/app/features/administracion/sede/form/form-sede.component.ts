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
import { SedeService } from '../services/sede.service';
import { SedeModel } from '../models/sede.model';

@Component({
  selector: 'app-form-sede',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './form-sede.component.html',
  styleUrl: './form-sede.component.css',
})
export class FormSedeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SedeService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<SedeModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({ code: r?.code ?? '', name: r?.name ?? '' });
      }
    });
  }

  isInvalid(field: 'code' | 'name'): boolean {
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
      const value = this.frm.getRawValue();
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...value }));
      } else {
        await lastValueFrom(this.service.create(value));
      }
      this.alert.success('Sede guardada');
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
    return 'No se pudo guardar la sede';
  }
}
