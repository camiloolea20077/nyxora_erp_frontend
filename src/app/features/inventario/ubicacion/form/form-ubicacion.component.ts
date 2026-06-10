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

import { AlertService } from '../../../../shared/services/alert.service';
import { UbicacionService } from '../services/ubicacion.service';
import { UbicacionModel, UbicacionTableModel } from '../models/ubicacion.model';
import { BodegaService } from '../../bodega/services/bodega.service';
import { BodegaTableModel } from '../../bodega/models/bodega.model';

@Component({
  selector: 'app-form-ubicacion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule],
  templateUrl: './form-ubicacion.component.html',
  styleUrl: './form-ubicacion.component.css',
})
export class FormUbicacionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UbicacionService);
  private readonly bodegaService = inject(BodegaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<UbicacionModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly bodegas = signal<BodegaTableModel[]>([]);
  readonly ubicaciones = signal<UbicacionTableModel[]>([]);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.group({
    bodegaId: this.fb.control<number | null>(null, [Validators.required]),
    ubicacionPadreId: this.fb.control<number | null>(null),
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    pasillo: this.fb.control<number | null>(null),
    altura: this.fb.control<number | null>(null),
    posicion: this.fb.control<number | null>(null),
  });

  constructor() {
    void this.cargar();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          bodegaId: r?.bodegaId ?? null,
          ubicacionPadreId: r?.ubicacionPadreId ?? null,
          codigo: r?.codigo ?? '',
          nombre: r?.nombre ?? '',
          pasillo: r?.pasillo ?? null,
          altura: r?.altura ?? null,
          posicion: r?.posicion ?? null,
        });
      }
    });
  }

  private async cargar(): Promise<void> {
    try {
      const [bod, ubi] = await Promise.all([
        lastValueFrom(this.bodegaService.list({ page: 0, rows: 500 })),
        lastValueFrom(this.service.list({ page: 0, rows: 5000 })),
      ]);
      this.bodegas.set(bod.data.content);
      this.ubicaciones.set(ubi.data.content);
    } catch {
      this.bodegas.set([]);
      this.ubicaciones.set([]);
    }
  }

  isInvalid(field: 'bodegaId' | 'codigo' | 'nombre'): boolean {
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
      this.alert.success('Ubicación guardada');
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
    return 'No se pudo guardar la ubicación';
  }
}
