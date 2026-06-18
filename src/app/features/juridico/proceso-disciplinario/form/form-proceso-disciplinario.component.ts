import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { VinculacionService } from '../../../nomina/vinculacion/services/vinculacion.service';
import { VinculacionTableModel } from '../../../nomina/vinculacion/models/vinculacion.model';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { ProcesoDisciplinarioService } from '../services/proceso-disciplinario.service';
import { ProcesoDisciplinarioModel } from '../models/proceso-disciplinario.model';

@Component({
  selector: 'app-form-proceso-disciplinario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, TextareaModule],
  templateUrl: './form-proceso-disciplinario.component.html',
  styleUrl: './form-proceso-disciplinario.component.css',
})
export class FormProcesoDisciplinarioComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProcesoDisciplinarioService);
  private readonly vinculacionService = inject(VinculacionService);
  private readonly terceroService = inject(TerceroService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ProcesoDisciplinarioModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());
  readonly vinculaciones = signal<VinculacionTableModel[]>([]);
  readonly terceros = signal<TerceroTableModel[]>([]);

  readonly frm = this.fb.group({
    fecha: this.fb.control<string | null>(null, [Validators.required]),
    vinculacionId: this.fb.control<number | null>(null),
    responsableId: this.fb.control<number | null>(null),
    descripcion: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargarCatalogos();
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 1000 };
    try {
      const [vin, ter] = await Promise.all([
        lastValueFrom(this.vinculacionService.list(req)),
        lastValueFrom(this.terceroService.list(req)),
      ]);
      this.vinculaciones.set(vin.data.content);
      this.terceros.set(ter.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      fecha: r?.fecha ?? null,
      vinculacionId: r?.vinculacionId ?? null,
      responsableId: r?.responsableId ?? null,
      descripcion: r?.descripcion ?? null,
    });
  }

  isInvalid(field: 'fecha'): boolean {
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
        fecha: v.fecha as string,
        vinculacionId: v.vinculacionId,
        responsableId: v.responsableId,
        descripcion: v.descripcion,
      };
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...payload }));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.alert.success('Proceso guardado');
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
    return 'No se pudo guardar el proceso';
  }
}
