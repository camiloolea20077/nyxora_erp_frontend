import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../../shared/models/catalogo.model';
import { TerceroSatelitesService } from '../services/tercero-satelites.service';
import { DireccionModel } from '../models/tercero-satelite.model';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-direcciones-tercero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    DialogModule,
    TagModule,
  ],
  templateUrl: './direcciones-tercero.component.html',
  styleUrl: './direcciones-tercero.component.css',
})
export class DireccionesTerceroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TerceroSatelitesService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly terceroId = input.required<number>();

  readonly items = signal<DireccionModel[]>([]);
  readonly municipios = signal<CatalogoItem[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<DireccionModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly tipos: Opcion[] = [
    { label: 'Principal', value: 'principal' },
    { label: 'Facturación', value: 'facturacion' },
    { label: 'Envío', value: 'envio' },
    { label: 'Otra', value: 'otra' },
  ];

  readonly frm = this.fb.group({
    tipo: this.fb.nonNullable.control('principal', [Validators.required]),
    direccion: this.fb.control<string | null>(null, [Validators.required]),
    municipioId: this.fb.control<number | null>(null),
    codigoPostal: this.fb.control<string | null>(null),
    telefono: this.fb.control<string | null>(null),
    principal: this.fb.nonNullable.control(false),
  });

  constructor() {
    void this.cargarMunicipios();
    effect(() => {
      if (this.terceroId()) void this.load();
    });
  }

  private async cargarMunicipios(): Promise<void> {
    try {
      const res = await lastValueFrom(this.catalogoService.list('municipio', { page: 0, rows: 5000 }));
      this.municipios.set(res.data.content);
    } catch {
      this.municipios.set([]);
    }
  }

  nombreMunicipio(id: number | null): string {
    if (id == null) return '';
    return this.municipios().find((m) => m.id === id)?.nombre ?? '';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listDirecciones(this.terceroId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset({ tipo: 'principal', direccion: null, municipioId: null, codigoPostal: null, telefono: null, principal: false });
    this.showForm.set(true);
  }
  editar(row: DireccionModel): void {
    this.editing.set(row);
    this.frm.reset({
      tipo: row.tipo ?? 'principal',
      direccion: row.direccion,
      municipioId: row.municipioId,
      codigoPostal: row.codigoPostal,
      telefono: row.telefono,
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
        await lastValueFrom(this.service.updateDireccion(this.terceroId(), { id: r.id, active: r.active, barrioId: null, ...v }));
      } else {
        await lastValueFrom(this.service.createDireccion(this.terceroId(), { barrioId: null, ...v }));
      }
      this.alert.success('Dirección guardada');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar la dirección');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: DireccionModel): void {
    this.confirm.confirm({
      message: '¿Eliminar esta dirección?',
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
      await lastValueFrom(this.service.deleteDireccion(this.terceroId(), id));
      this.alert.success('Dirección eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la dirección');
    }
  }
}
