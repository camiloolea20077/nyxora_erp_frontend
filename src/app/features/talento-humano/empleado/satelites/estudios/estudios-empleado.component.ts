import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../../shared/models/catalogo.model';
import { EmpleadoSatelitesService } from '../../services/empleado-satelites.service';
import { EstudioModel } from '../../models/talento-humano.model';

@Component({
  selector: 'app-estudios-empleado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    DialogModule,
    TagModule,
  ],
  templateUrl: './estudios-empleado.component.html',
  styleUrl: './estudios-empleado.component.css',
})
export class EstudiosEmpleadoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EmpleadoSatelitesService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly empleadoId = input.required<number>();

  readonly items = signal<EstudioModel[]>([]);
  readonly niveles = signal<CatalogoItem[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<EstudioModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly frm = this.fb.group({
    nivelEstudioId: this.fb.control<number | null>(null),
    institucion: this.fb.control<string | null>(null),
    titulo: this.fb.control<string | null>(null, [Validators.required]),
    fechaInicial: this.fb.control<string | null>(null),
    fechaFinal: this.fb.control<string | null>(null),
    fechaGrado: this.fb.control<string | null>(null),
    numeroTarjetaProfesional: this.fb.control<string | null>(null),
    municipioEstudioId: this.fb.control<number | null>(null),
    semestresAprobados: this.fb.control<number | null>(null),
    convalidado: this.fb.nonNullable.control(false),
  });

  constructor() {
    void this.cargarNiveles();
    effect(() => {
      if (this.empleadoId()) void this.load();
    });
  }

  nivelNombre(id: number | null): string {
    if (id == null) return '';
    return this.niveles().find((n) => n.id === id)?.nombre ?? '';
  }

  private async cargarNiveles(): Promise<void> {
    try {
      const res = await lastValueFrom(this.catalogoService.list('nivel-estudio', { page: 0, rows: 500 }));
      this.niveles.set(res.data.content);
    } catch {
      this.niveles.set([]);
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listEstudios(this.empleadoId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset({ convalidado: false });
    this.showForm.set(true);
  }
  editar(row: EstudioModel): void {
    this.editing.set(row);
    this.frm.reset({
      nivelEstudioId: row.nivelEstudioId,
      institucion: row.institucion,
      titulo: row.titulo,
      fechaInicial: row.fechaInicial,
      fechaFinal: row.fechaFinal,
      fechaGrado: row.fechaGrado,
      numeroTarjetaProfesional: row.numeroTarjetaProfesional,
      municipioEstudioId: row.municipioEstudioId,
      semestresAprobados: row.semestresAprobados,
      convalidado: row.convalidado ?? false,
    });
    this.showForm.set(true);
  }
  close(): void {
    this.showForm.set(false);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const v = this.frm.getRawValue();
      const r = this.editing();
      if (r) {
        await lastValueFrom(this.service.updateEstudio(this.empleadoId(), { id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.createEstudio(this.empleadoId(), v));
      }
      this.alert.success('Estudio guardado');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar el estudio');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: EstudioModel): void {
    this.confirm.confirm({
      message: `¿Eliminar el estudio "${row.titulo}"?`,
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
      await lastValueFrom(this.service.deleteEstudio(this.empleadoId(), id));
      this.alert.success('Estudio eliminado');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar el estudio');
    }
  }
}
