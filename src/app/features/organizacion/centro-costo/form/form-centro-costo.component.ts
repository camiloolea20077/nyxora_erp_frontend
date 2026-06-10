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
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

import { AlertService } from '../../../../shared/services/alert.service';
import { CentroCostoService } from '../services/centro-costo.service';
import { CentroCostoModel, CentroCostoTableModel } from '../models/centro-costo.model';
import { SedeService } from '../../../administracion/sede/services/sede.service';
import { SedeTableModel } from '../../../administracion/sede/models/sede.model';

@Component({
  selector: 'app-form-centro-costo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, CheckboxModule],
  templateUrl: './form-centro-costo.component.html',
  styleUrl: './form-centro-costo.component.css',
})
export class FormCentroCostoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CentroCostoService);
  private readonly sedeService = inject(SedeService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<CentroCostoModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly sedes = signal<SedeTableModel[]>([]);
  readonly centros = signal<CentroCostoTableModel[]>([]);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    sedeId: this.fb.control<number | null>(null),
    centroCostoPadreId: this.fb.control<number | null>(null),
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    tipoCentroCosto: this.fb.control<string | null>(null),
    claseCentroCosto: this.fb.control<string | null>(null),
    esObservacion: this.fb.nonNullable.control(false),
    manejaPlanFinanciero: this.fb.nonNullable.control(false),
    direccion: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargar();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          sedeId: r?.sedeId ?? null,
          centroCostoPadreId: r?.centroCostoPadreId ?? null,
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          tipoCentroCosto: r?.tipoCentroCosto ?? null,
          claseCentroCosto: r?.claseCentroCosto ?? null,
          esObservacion: r?.esObservacion ?? false,
          manejaPlanFinanciero: r?.manejaPlanFinanciero ?? false,
          direccion: r?.direccion ?? null,
        });
      }
    });
  }

  private async cargar(): Promise<void> {
    try {
      const [sedes, centros] = await Promise.all([
        lastValueFrom(this.sedeService.list({ page: 0, rows: 500 })),
        lastValueFrom(this.service.list({ page: 0, rows: 5000 })),
      ]);
      this.sedes.set(sedes.data.content);
      this.centros.set(centros.data.content);
    } catch {
      this.sedes.set([]);
      this.centros.set([]);
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
      this.alert.success('Centro de costo guardado');
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
    return 'No se pudo guardar el centro de costo';
  }
}
