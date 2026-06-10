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
import { BodegaService } from '../services/bodega.service';
import { BodegaModel } from '../models/bodega.model';
import { SedeService } from '../../../administracion/sede/services/sede.service';
import { SedeTableModel } from '../../../administracion/sede/models/sede.model';
import { CentroCostoService } from '../../../organizacion/centro-costo/services/centro-costo.service';
import { CentroCostoTableModel } from '../../../organizacion/centro-costo/models/centro-costo.model';

@Component({
  selector: 'app-form-bodega',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, CheckboxModule],
  templateUrl: './form-bodega.component.html',
  styleUrl: './form-bodega.component.css',
})
export class FormBodegaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BodegaService);
  private readonly sedeService = inject(SedeService);
  private readonly centroService = inject(CentroCostoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<BodegaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly sedes = signal<SedeTableModel[]>([]);
  readonly centros = signal<CentroCostoTableModel[]>([]);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    sedeId: this.fb.control<number | null>(null),
    centroCostoId: this.fb.control<number | null>(null),
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    tipoAbastecimiento: this.fb.control<string | null>(null),
    direccion: this.fb.control<string | null>(null),
    latitud: this.fb.control<string | null>(null),
    longitud: this.fb.control<string | null>(null),
    permiteCompra: this.fb.nonNullable.control(true),
  });

  constructor() {
    void this.cargar();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          sedeId: r?.sedeId ?? null,
          centroCostoId: r?.centroCostoId ?? null,
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          tipoAbastecimiento: r?.tipoAbastecimiento ?? null,
          direccion: r?.direccion ?? null,
          latitud: r?.latitud ?? null,
          longitud: r?.longitud ?? null,
          permiteCompra: r?.permiteCompra ?? true,
        });
      }
    });
  }

  private async cargar(): Promise<void> {
    try {
      const [sedes, centros] = await Promise.all([
        lastValueFrom(this.sedeService.list({ page: 0, rows: 500 })),
        lastValueFrom(this.centroService.list({ page: 0, rows: 5000 })),
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
      this.alert.success('Bodega guardada');
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
    return 'No se pudo guardar la bodega';
  }
}
