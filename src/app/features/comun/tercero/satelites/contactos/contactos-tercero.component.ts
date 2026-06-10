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
import { TerceroSatelitesService } from '../services/tercero-satelites.service';
import { ContactoModel } from '../models/tercero-satelite.model';

@Component({
  selector: 'app-contactos-tercero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    DialogModule,
    TagModule,
  ],
  templateUrl: './contactos-tercero.component.html',
  styleUrl: './contactos-tercero.component.css',
})
export class ContactosTerceroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TerceroSatelitesService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly terceroId = input.required<number>();

  readonly items = signal<ContactoModel[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<ContactoModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly frm = this.fb.group({
    nombre: this.fb.control<string | null>(null, [Validators.required]),
    cargo: this.fb.control<string | null>(null),
    telefono: this.fb.control<string | null>(null),
    celular: this.fb.control<string | null>(null),
    email: this.fb.control<string | null>(null),
    notas: this.fb.control<string | null>(null),
    principal: this.fb.nonNullable.control(false),
  });

  constructor() {
    effect(() => {
      if (this.terceroId()) void this.load();
    });
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listContactos(this.terceroId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset({ nombre: null, cargo: null, telefono: null, celular: null, email: null, notas: null, principal: false });
    this.showForm.set(true);
  }
  editar(row: ContactoModel): void {
    this.editing.set(row);
    this.frm.reset({
      nombre: row.nombre,
      cargo: row.cargo,
      telefono: row.telefono,
      celular: row.celular,
      email: row.email,
      notas: row.notas,
      principal: row.principal ?? false,
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
        await lastValueFrom(this.service.updateContacto(this.terceroId(), { id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.createContacto(this.terceroId(), v));
      }
      this.alert.success('Contacto guardado');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar el contacto');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: ContactoModel): void {
    this.confirm.confirm({
      message: `¿Eliminar el contacto "${row.nombre}"?`,
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
      await lastValueFrom(this.service.deleteContacto(this.terceroId(), id));
      this.alert.success('Contacto eliminado');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar el contacto');
    }
  }
}
