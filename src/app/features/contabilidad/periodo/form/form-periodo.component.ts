import { ChangeDetectionStrategy, Component, effect, inject, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { PeriodoService } from '../services/periodo.service';
import { MESES } from '../meses';
import { VigenciaService } from '../../../administracion/vigencia/services/vigencia.service';
import { VigenciaTableModel } from '../../../administracion/vigencia/models/vigencia.model';

@Component({
  selector: 'app-form-periodo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputNumberModule, SelectModule],
  templateUrl: './form-periodo.component.html',
  styleUrl: './form-periodo.component.css',
})
export class FormPeriodoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PeriodoService);
  private readonly vigenciaService = inject(VigenciaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly vigencias = signal<VigenciaTableModel[]>([]);
  readonly meses = MESES;

  readonly frm = this.fb.group({
    vigenciaId: this.fb.control<number | null>(null, [Validators.required]),
    anio: this.fb.control<number | null>(new Date().getFullYear(), [Validators.required]),
    mes: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor() {
    void this.cargar();
    effect(() => {
      if (this.visible()) {
        this.frm.reset({ vigenciaId: null, anio: new Date().getFullYear(), mes: null });
      }
    });
  }

  private async cargar(): Promise<void> {
    try {
      const res = await lastValueFrom(this.vigenciaService.list({ page: 0, rows: 500 }));
      this.vigencias.set(res.data.content);
    } catch {
      this.vigencias.set([]);
    }
  }

  onVigenciaChange(id: number | null): void {
    const v = this.vigencias().find((x) => x.id === id);
    if (v) this.frm.controls.anio.setValue(v.year);
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
      await lastValueFrom(
        this.service.create({ vigenciaId: v.vigenciaId as number, anio: v.anio as number, mes: v.mes as number }),
      );
      this.alert.success('Periodo creado');
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
    return 'No se pudo crear el periodo';
  }
}
