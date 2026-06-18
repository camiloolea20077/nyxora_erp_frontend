import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../../shared/services/alert.service';
import { EvaluacionDesempenoService } from '../../services/evaluacion-desempeno.service';
import { EvaluacionProgramaService } from '../../../evaluacion-programa/services/evaluacion-programa.service';
import { EvaluacionProgramaTableModel } from '../../../evaluacion-programa/models/evaluacion-programa.model';
import { EvaluacionDesempenoModel, EvaluacionDesempenoTableModel } from '../../models/talento-humano.model';

@Component({
  selector: 'app-evaluaciones-empleado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DialogModule,
  ],
  templateUrl: './evaluaciones-empleado.component.html',
  styleUrl: './evaluaciones-empleado.component.css',
})
export class EvaluacionesEmpleadoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EvaluacionDesempenoService);
  private readonly programaService = inject(EvaluacionProgramaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly empleadoId = input.required<number>();

  readonly items = signal<EvaluacionDesempenoTableModel[]>([]);
  readonly programas = signal<EvaluacionProgramaTableModel[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<EvaluacionDesempenoModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly frm = this.fb.group({
    evaluacionProgramaId: this.fb.control<number | null>(null),
    tipoEvaluacion: this.fb.control<string | null>(null),
    fechaInicial: this.fb.control<string | null>(null),
    fechaFinal: this.fb.control<string | null>(null),
    calificacion: this.fb.control<number | null>(null),
  });

  constructor() {
    void this.cargarProgramas();
    effect(() => {
      if (this.empleadoId()) void this.load();
    });
  }

  programaNombre(id: number | null): string {
    if (id == null) return '';
    return this.programas().find((p) => p.id === id)?.nombre ?? '';
  }

  private async cargarProgramas(): Promise<void> {
    try {
      const res = await lastValueFrom(this.programaService.list({ page: 0, rows: 500 }));
      this.programas.set(res.data.content);
    } catch {
      this.programas.set([]);
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.list({ page: 0, rows: 200 }, this.empleadoId()));
      this.items.set(res.data.content);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset();
    this.showForm.set(true);
  }
  async editar(row: EvaluacionDesempenoTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      const r = res.data;
      this.editing.set(r);
      this.frm.reset({
        evaluacionProgramaId: r.evaluacionProgramaId,
        tipoEvaluacion: r.tipoEvaluacion,
        fechaInicial: r.fechaInicial,
        fechaFinal: r.fechaFinal,
        calificacion: r.calificacion,
      });
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la evaluación');
    }
  }
  close(): void {
    this.showForm.set(false);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const v = this.frm.getRawValue();
      const r = this.editing();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, empleadoId: this.empleadoId(), ...v }));
      } else {
        await lastValueFrom(this.service.create({ empleadoId: this.empleadoId(), ...v }));
      }
      this.alert.success('Evaluación guardada');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar la evaluación');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: EvaluacionDesempenoTableModel): void {
    this.confirm.confirm({
      message: '¿Eliminar esta evaluación?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doDelete(row.id),
    });
  }
  private async doDelete(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.delete(id));
      this.alert.success('Evaluación eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la evaluación');
    }
  }
}
