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

import { AlertService } from '../../../../shared/services/alert.service';
import { DependenciaService } from '../services/dependencia.service';
import { DependenciaModel, DependenciaTableModel } from '../models/dependencia.model';
import { CentroCostoService } from '../../centro-costo/services/centro-costo.service';
import { CentroCostoTableModel } from '../../centro-costo/models/centro-costo.model';

@Component({
  selector: 'app-form-dependencia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './form-dependencia.component.html',
  styleUrl: './form-dependencia.component.css',
})
export class FormDependenciaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DependenciaService);
  private readonly centroService = inject(CentroCostoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<DependenciaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly centros = signal<CentroCostoTableModel[]>([]);
  readonly dependencias = signal<DependenciaTableModel[]>([]);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    centroCostoId: this.fb.control<number | null>(null),
    dependenciaPadreId: this.fb.control<number | null>(null),
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    ubicacion: this.fb.control<string | null>(null),
    latitud: this.fb.control<string | null>(null),
    longitud: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargar();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          centroCostoId: r?.centroCostoId ?? null,
          dependenciaPadreId: r?.dependenciaPadreId ?? null,
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          ubicacion: r?.ubicacion ?? null,
          latitud: r?.latitud ?? null,
          longitud: r?.longitud ?? null,
        });
      }
    });
  }

  private async cargar(): Promise<void> {
    try {
      const [centros, deps] = await Promise.all([
        lastValueFrom(this.centroService.list({ page: 0, rows: 5000 })),
        lastValueFrom(this.service.list({ page: 0, rows: 5000 })),
      ]);
      this.centros.set(centros.data.content);
      this.dependencias.set(deps.data.content);
    } catch {
      this.centros.set([]);
      this.dependencias.set([]);
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
      this.alert.success('Dependencia guardada');
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
    return 'No se pudo guardar la dependencia';
  }
}
