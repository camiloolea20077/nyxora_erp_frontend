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
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { ConceptoNominaService } from '../services/concepto-nomina.service';
import { ConceptoNominaModel } from '../models/concepto-nomina.model';

@Component({
  selector: 'app-form-concepto-nomina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './form-concepto-nomina.component.html',
  styleUrl: './form-concepto-nomina.component.css',
})
export class FormConceptoNominaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ConceptoNominaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ConceptoNominaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly clases = [
    { label: 'Devengado', value: 'devengado' },
    { label: 'Deducción', value: 'deduccion' },
    { label: 'Provisión', value: 'provision' },
    { label: 'Aporte', value: 'aporte' },
  ];
  readonly frecuencias = [
    { label: 'Mensual', value: 'mensual' },
    { label: 'Quincenal', value: 'quincenal' },
    { label: 'Anual', value: 'anual' },
    { label: 'Ocasional', value: 'ocasional' },
  ];

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(250)]),
    clase: this.fb.control<string | null>(null, [Validators.required]),
    frecuencia: this.fb.control<string | null>(null),
    formula: this.fb.control<string | null>(null),
  });

  /** Resetea el formulario al abrir el diálogo (no en un effect, para no resetear al interactuar con los selects). */
  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      codigo: r?.codigo ?? '',
      nombre: r?.nombre ?? '',
      clase: r?.clase ?? null,
      frecuencia: r?.frecuencia ?? null,
      formula: r?.formula ?? null,
    });
  }

  isInvalid(field: 'codigo' | 'nombre' | 'clase'): boolean {
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
        codigo: v.codigo,
        nombre: v.nombre,
        clase: v.clase as string,
        frecuencia: v.frecuencia,
        formula: v.formula,
        cuentaCreditoId: r?.cuentaCreditoId ?? null,
        cuentaPatronoId: r?.cuentaPatronoId ?? null,
        rubroPresupuestalId: r?.rubroPresupuestalId ?? null,
        fuenteFinanciamientoId: r?.fuenteFinanciamientoId ?? null,
        terceroId: r?.terceroId ?? null,
      };
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...payload }));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.alert.success('Concepto guardado');
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
    return 'No se pudo guardar el concepto';
  }
}
