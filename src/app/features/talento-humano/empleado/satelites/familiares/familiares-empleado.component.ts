import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { FamiliarModel } from '../../models/talento-humano.model';

@Component({
  selector: 'app-familiares-empleado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TableModule, ButtonModule, InputTextModule, CheckboxModule, DialogModule, TagModule],
  templateUrl: './familiares-empleado.component.html',
  styleUrl: './familiares-empleado.component.css',
})
export class FamiliaresEmpleadoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EmpleadoSatelitesService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly empleadoId = input.required<number>();

  readonly items = signal<FamiliarModel[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<FamiliarModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly frm = this.fb.group({
    nombreApellido: this.fb.nonNullable.control('', [Validators.required]),
    fechaNacimiento: this.fb.control<string | null>(null),
    parentesco: this.fb.control<string | null>(null),
    aCargo: this.fb.nonNullable.control(false),
    vivo: this.fb.nonNullable.control(true),
    convive: this.fb.nonNullable.control(false),
    dependienteRetencion: this.fb.nonNullable.control(false),
  });

  constructor() {
    effect(() => {
      if (this.empleadoId()) void this.load();
    });
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listFamiliares(this.empleadoId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset({ aCargo: false, vivo: true, convive: false, dependienteRetencion: false });
    this.showForm.set(true);
  }
  editar(row: FamiliarModel): void {
    this.editing.set(row);
    this.frm.reset({
      nombreApellido: row.nombreApellido ?? '',
      fechaNacimiento: row.fechaNacimiento,
      parentesco: row.parentesco,
      aCargo: row.aCargo ?? false,
      vivo: row.vivo ?? true,
      convive: row.convive ?? false,
      dependienteRetencion: row.dependienteRetencion ?? false,
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
        await lastValueFrom(this.service.updateFamiliar(this.empleadoId(), { id: r.id, ...v }));
      } else {
        await lastValueFrom(this.service.createFamiliar(this.empleadoId(), v));
      }
      this.alert.success('Familiar guardado');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar el familiar');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: FamiliarModel): void {
    this.confirm.confirm({
      message: `¿Eliminar a "${row.nombreApellido}"?`,
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
      await lastValueFrom(this.service.deleteFamiliar(this.empleadoId(), id));
      this.alert.success('Familiar eliminado');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar el familiar');
    }
  }
}
