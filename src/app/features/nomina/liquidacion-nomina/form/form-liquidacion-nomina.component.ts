import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { GrupoNominaService } from '../../grupo-nomina/services/grupo-nomina.service';
import { GrupoNominaTableModel } from '../../grupo-nomina/models/grupo-nomina.model';
import { LiquidacionNominaService } from '../services/liquidacion-nomina.service';
import { LiquidacionNominaModel } from '../models/liquidacion-nomina.model';

@Component({
  selector: 'app-form-liquidacion-nomina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
  ],
  templateUrl: './form-liquidacion-nomina.component.html',
  styleUrl: './form-liquidacion-nomina.component.css',
})
export class FormLiquidacionNominaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(LiquidacionNominaService);
  private readonly grupoService = inject(GrupoNominaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<LiquidacionNominaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());
  readonly grupos = signal<GrupoNominaTableModel[]>([]);

  readonly frm = this.fb.group({
    grupoNominaId: this.fb.control<number | null>(null),
    anio: this.fb.control<number | null>(new Date().getFullYear(), [Validators.required]),
    mes: this.fb.control<number | null>(new Date().getMonth() + 1, [Validators.required]),
    periodo: this.fb.control<string | null>(null),
    fecha: this.fb.control<string | null>(null, [Validators.required]),
  });

  constructor() {
    void this.cargarGrupos();
  }

  private async cargarGrupos(): Promise<void> {
    try {
      const res = await lastValueFrom(this.grupoService.list({ page: 0, rows: 500 }));
      this.grupos.set(res.data.content);
    } catch {
      this.grupos.set([]);
    }
  }

  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      grupoNominaId: r?.grupoNominaId ?? null,
      anio: r?.anio ?? new Date().getFullYear(),
      mes: r?.mes ?? new Date().getMonth() + 1,
      periodo: r?.periodo ?? null,
      fecha: r?.fecha ?? null,
    });
  }

  isInvalid(field: 'anio' | 'mes' | 'fecha'): boolean {
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
      const payload = {
        grupoNominaId: v.grupoNominaId,
        anio: v.anio as number,
        mes: v.mes as number,
        periodo: v.periodo,
        fecha: v.fecha as string,
      };
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...payload }));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.alert.success('Liquidación guardada');
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
    return 'No se pudo guardar la liquidación';
  }
}
