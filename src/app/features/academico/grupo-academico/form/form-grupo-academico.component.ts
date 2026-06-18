import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { ProgramaService } from '../../programa/services/programa.service';
import { ProgramaTableModel } from '../../programa/models/programa.model';
import { GrupoAcademicoService } from '../services/grupo-academico.service';
import { GrupoAcademicoModel } from '../models/grupo-academico.model';

@Component({
  selector: 'app-form-grupo-academico',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './form-grupo-academico.component.html',
  styleUrl: './form-grupo-academico.component.css',
})
export class FormGrupoAcademicoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(GrupoAcademicoService);
  private readonly programaService = inject(ProgramaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<GrupoAcademicoModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());
  readonly programas = signal<ProgramaTableModel[]>([]);

  readonly frm = this.fb.group({
    programaAcademicoId: this.fb.control<number | null>(null),
    codigo: this.fb.control<string | null>(null),
    nombre: this.fb.nonNullable.control('', [Validators.required]),
    periodo: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargarProgramas();
  }

  private async cargarProgramas(): Promise<void> {
    try {
      const res = await lastValueFrom(this.programaService.list({ page: 0, rows: 500 }));
      this.programas.set(res.data.content);
    } catch {
      this.programas.set([]);
    }
  }

  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      programaAcademicoId: r?.programaAcademicoId ?? null,
      codigo: r?.codigo ?? null,
      nombre: r?.nombre ?? '',
      periodo: r?.periodo ?? null,
    });
  }

  isInvalid(field: 'nombre'): boolean {
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
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.create(v));
      }
      this.alert.success('Grupo guardado');
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
    return 'No se pudo guardar el grupo';
  }
}
