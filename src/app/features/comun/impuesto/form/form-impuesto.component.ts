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
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

import { AlertService } from '../../../../shared/services/alert.service';
import { ImpuestoService } from '../services/impuesto.service';
import { ImpuestoModel } from '../models/impuesto.model';
import { VigenciaService } from '../../../administracion/vigencia/services/vigencia.service';
import { VigenciaTableModel } from '../../../administracion/vigencia/models/vigencia.model';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form-impuesto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
  ],
  templateUrl: './form-impuesto.component.html',
  styleUrl: './form-impuesto.component.css',
})
export class FormImpuestoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ImpuestoService);
  private readonly vigenciaService = inject(VigenciaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ImpuestoModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly vigencias = signal<VigenciaTableModel[]>([]);
  readonly isEdit = computed(() => !!this.registro());

  readonly tipos: Opcion[] = [
    { label: 'IVA', value: 'iva' },
    { label: 'Retefuente', value: 'retefuente' },
    { label: 'ReteIVA', value: 'reteiva' },
    { label: 'ICA', value: 'ica' },
    { label: 'ReteICA', value: 'reteica' },
    { label: 'Consumo', value: 'consumo' },
  ];
  readonly causaciones: Opcion[] = [
    { label: 'Compra', value: 'compra' },
    { label: 'Venta', value: 'venta' },
    { label: 'Ambos', value: 'ambos' },
  ];
  readonly periodicidades: Opcion[] = [
    { label: 'Mensual', value: 'mensual' },
    { label: 'Bimestral', value: 'bimestral' },
    { label: 'Cuatrimestral', value: 'cuatrimestral' },
    { label: 'Anual', value: 'anual' },
  ];

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    tipo: this.fb.control<string | null>('iva'),
    tarifa: this.fb.control<number | null>(0),
    causacion: this.fb.control<string | null>('ambos'),
    baseGravable: this.fb.control<string | null>(null),
    periodicidad: this.fb.control<string | null>('mensual'),
    aplicaAiu: this.fb.nonNullable.control(false),
    retencionNomina: this.fb.nonNullable.control(false),
    vigenciaId: this.fb.control<number | null>(null),
  });

  constructor() {
    void this.cargarVigencias();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          tipo: r?.tipo ?? 'iva',
          tarifa: r?.tarifa ?? 0,
          causacion: r?.causacion ?? 'ambos',
          baseGravable: r?.baseGravable ?? null,
          periodicidad: r?.periodicidad ?? 'mensual',
          aplicaAiu: r?.aplicaAiu ?? false,
          retencionNomina: r?.retencionNomina ?? false,
          vigenciaId: r?.vigenciaId ?? null,
        });
      }
    });
  }

  private async cargarVigencias(): Promise<void> {
    try {
      const res = await lastValueFrom(this.vigenciaService.list({ page: 0, rows: 500 }));
      this.vigencias.set(res.data.content);
    } catch {
      this.vigencias.set([]);
    }
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
        await lastValueFrom(this.service.update({ id: r.id, ...v }));
      } else {
        await lastValueFrom(this.service.create(v));
      }
      this.alert.success('Impuesto guardado');
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
    return 'No se pudo guardar el impuesto';
  }
}
