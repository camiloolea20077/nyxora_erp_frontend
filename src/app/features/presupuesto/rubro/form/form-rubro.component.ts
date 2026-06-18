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
import { RubroPresupuestalService } from '../services/rubro.service';
import { RubroPresupuestalModel, RubroPresupuestalTableModel } from '../models/rubro.model';
import { VigenciaService } from '../../../administracion/vigencia/services/vigencia.service';
import { VigenciaTableModel } from '../../../administracion/vigencia/models/vigencia.model';

interface TipoOpt {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form-rubro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, CheckboxModule],
  templateUrl: './form-rubro.component.html',
  styleUrl: './form-rubro.component.css',
})
export class FormRubroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RubroPresupuestalService);
  private readonly vigenciaService = inject(VigenciaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<RubroPresupuestalModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());
  readonly vigencias = signal<VigenciaTableModel[]>([]);
  readonly rubros = signal<RubroPresupuestalTableModel[]>([]);

  readonly tipos: TipoOpt[] = [
    { label: 'Gasto', value: 'gasto' },
    { label: 'Ingreso', value: 'ingreso' },
  ];

  readonly frm = this.fb.group({
    vigenciaId: this.fb.control<number | null>(null, [Validators.required]),
    rubroPadreId: this.fb.control<number | null>(null),
    tipoRubro: this.fb.control<string | null>('gasto'),
    codigoRubro: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(40)]),
    nombreRubro: this.fb.nonNullable.control('', [Validators.required]),
    manejaMovimiento: this.fb.nonNullable.control(false),
    homologacionCircularUnica: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargarCatalogos();
    effect(() => {
      // Solo depende de visible()/registro(); no lee las señales de catálogos para evitar
      // que el form se resetee cuando llega la data asíncrona (borrando la selección).
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({
          vigenciaId: r?.vigenciaId ?? null,
          rubroPadreId: r?.rubroPadreId ?? null,
          tipoRubro: r?.tipoRubro ?? 'gasto',
          codigoRubro: r?.codigoRubro ?? '',
          nombreRubro: r?.nombreRubro ?? '',
          manejaMovimiento: r?.manejaMovimiento ?? false,
          homologacionCircularUnica: r?.homologacionCircularUnica ?? null,
        });
      }
    });
  }

  /** Carga catálogos una sola vez; cada uno con su propio manejo para que un fallo no afecte al otro. */
  private async cargarCatalogos(): Promise<void> {
    try {
      const vig = await lastValueFrom(this.vigenciaService.list({ page: 0, rows: 5000 }));
      this.vigencias.set(vig.data.content);
    } catch {
      /* ignore */
    }
    try {
      const rub = await lastValueFrom(this.service.list({ page: 0, rows: 5000 }));
      this.rubros.set(rub.data.content);
    } catch {
      /* ignore */
    }
  }

  isInvalid(field: 'vigenciaId' | 'codigoRubro' | 'nombreRubro'): boolean {
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
      this.alert.success('Rubro guardado');
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
    return 'No se pudo guardar el rubro';
  }
}
