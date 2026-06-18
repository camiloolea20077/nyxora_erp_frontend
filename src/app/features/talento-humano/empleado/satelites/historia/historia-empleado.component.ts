import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../../shared/services/alert.service';
import { EmpleadoSatelitesService } from '../../services/empleado-satelites.service';
import { HistoriaLaboralModel } from '../../models/talento-humano.model';

@Component({
  selector: 'app-historia-empleado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TableModule, ButtonModule, InputTextModule, CheckboxModule, DialogModule, TagModule],
  templateUrl: './historia-empleado.component.html',
  styleUrl: './historia-empleado.component.css',
})
export class HistoriaEmpleadoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EmpleadoSatelitesService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly empleadoId = input.required<number>();

  readonly items = signal<HistoriaLaboralModel[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<HistoriaLaboralModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly frm = this.fb.group({
    nombreEmpresa: this.fb.control<string | null>(null),
    cargo: this.fb.control<string | null>(null),
    tipoContrato: this.fb.control<string | null>(null),
    fechaInicio: this.fb.control<string | null>(null),
    fechaFinal: this.fb.control<string | null>(null),
    jefeInmediato: this.fb.control<string | null>(null),
    municipioId: this.fb.control<number | null>(null),
    esPublico: this.fb.nonNullable.control(false),
  });

  constructor() {
    effect(() => {
      if (this.empleadoId()) void this.load();
    });
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listHistorias(this.empleadoId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset({ esPublico: false });
    this.showForm.set(true);
  }
  editar(row: HistoriaLaboralModel): void {
    this.editing.set(row);
    this.frm.reset({
      nombreEmpresa: row.nombreEmpresa,
      cargo: row.cargo,
      tipoContrato: row.tipoContrato,
      fechaInicio: row.fechaInicio,
      fechaFinal: row.fechaFinal,
      jefeInmediato: row.jefeInmediato,
      municipioId: row.municipioId,
      esPublico: row.esPublico ?? false,
    });
    this.showForm.set(true);
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
        await lastValueFrom(this.service.updateHistoria(this.empleadoId(), { id: r.id, ...v }));
      } else {
        await lastValueFrom(this.service.createHistoria(this.empleadoId(), v));
      }
      this.alert.success('Historia laboral guardada');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar la historia laboral');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: HistoriaLaboralModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la experiencia en "${row.nombreEmpresa}"?`,
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
      await lastValueFrom(this.service.deleteHistoria(this.empleadoId(), id));
      this.alert.success('Historia laboral eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la historia laboral');
    }
  }
}
