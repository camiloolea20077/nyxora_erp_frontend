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
import { CategoriaService } from '../services/categoria.service';
import { CategoriaModel, CategoriaTableModel } from '../models/categoria.model';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form-categoria',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './form-categoria.component.html',
  styleUrl: './form-categoria.component.css',
})
export class FormCategoriaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CategoriaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<CategoriaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly categorias = signal<CategoriaTableModel[]>([]);
  readonly isEdit = computed(() => !!this.registro());

  readonly tiposProducto: Opcion[] = [
    { label: 'Bien', value: 'bien' },
    { label: 'Servicio', value: 'servicio' },
    { label: 'Activo', value: 'activo' },
  ];
  readonly metodosCosteo: Opcion[] = [
    { label: 'Promedio', value: 'promedio' },
    { label: 'PEPS', value: 'peps' },
    { label: 'Estándar', value: 'estandar' },
  ];

  readonly frm = this.fb.group({
    categoriaPadreId: this.fb.control<number | null>(null),
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    tipoProducto: this.fb.control<string | null>('bien'),
    metodoCosteo: this.fb.control<string | null>('promedio'),
  });

  constructor() {
    void this.cargarCategorias();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          categoriaPadreId: r?.categoriaPadreId ?? null,
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          tipoProducto: r?.tipoProducto ?? 'bien',
          metodoCosteo: r?.metodoCosteo ?? 'promedio',
        });
      }
    });
  }

  private async cargarCategorias(): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.list({ page: 0, rows: 5000 }));
      this.categorias.set(res.data.content);
    } catch {
      this.categorias.set([]);
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
      this.alert.success('Categoría guardada');
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
    return 'No se pudo guardar la categoría';
  }
}
