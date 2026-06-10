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
import { MultiSelectModule } from 'primeng/multiselect';

import { AlertService } from '../../../../shared/services/alert.service';
import { PermisoService } from '../../permiso/services/permiso.service';
import { PermisoModel } from '../../permiso/models/permiso.model';
import { RolService } from '../services/rol.service';
import { RolModel } from '../models/rol.model';

@Component({
  selector: 'app-form-rol',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, MultiSelectModule],
  templateUrl: './form-rol.component.html',
  styleUrl: './form-rol.component.css',
})
export class FormRolComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RolService);
  private readonly permisoService = inject(PermisoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<RolModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly permisos = signal<PermisoModel[]>([]);
  readonly isEdit = computed(() => !!this.registro());

  readonly frm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    permisoIds: [[] as number[]],
  });

  constructor() {
    void this.loadPermisos();
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        this.frm.reset({ name: r?.name ?? '', permisoIds: r?.permisoIds ?? [] });
      }
    });
  }

  private async loadPermisos(): Promise<void> {
    try {
      const res = await lastValueFrom(this.permisoService.getAll());
      this.permisos.set(res.data);
    } catch {
      this.permisos.set([]);
    }
  }

  get invalidName(): boolean {
    const c = this.frm.controls.name;
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
      const value = this.frm.getRawValue();
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...value }));
      } else {
        await lastValueFrom(this.service.create(value));
      }
      this.alert.success('Rol guardado');
      this.saved.emit();
      this.close();
    } catch (e: unknown) {
      this.alert.error(this.extractMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  private extractMessage(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo guardar el rol';
  }
}
