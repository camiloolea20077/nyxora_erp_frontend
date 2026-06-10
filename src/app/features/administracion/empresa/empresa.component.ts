import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

import { AlertService } from '../../../shared/services/alert.service';
import { CatalogoService } from '../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../shared/models/catalogo.model';
import { EmpresaService } from './services/empresa.service';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-empresa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
  ],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.css',
})
export class EmpresaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EmpresaService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  private readonly empresaId = signal<number | null>(null);

  // Catálogos
  readonly tiposContribuyente = signal<CatalogoItem[]>([]);
  readonly actividades = signal<CatalogoItem[]>([]);
  // Cascade geográfico
  readonly paises = signal<CatalogoItem[]>([]);
  readonly departamentos = signal<CatalogoItem[]>([]);
  readonly municipios = signal<CatalogoItem[]>([]);
  readonly selectedPaisId = signal<number | null>(null);
  readonly selectedDepartamentoId = signal<number | null>(null);

  readonly tiposPersona: Opcion[] = [
    { label: 'Jurídica', value: 'juridica' },
    { label: 'Natural', value: 'natural' },
  ];

  readonly frm = this.fb.group({
    nit: this.fb.nonNullable.control('', [Validators.required]),
    digitoVerificacion: this.fb.control<number | null>(null),
    razonSocial: this.fb.nonNullable.control('', [Validators.required]),
    nombreComercial: this.fb.control<string | null>(null),
    codigo: this.fb.control<string | null>(null),
    tipoPersona: this.fb.nonNullable.control('juridica', [Validators.required]),
    representanteLegal: this.fb.control<string | null>(null),
    regimenTributario: this.fb.control<string | null>(null),
    tipoContribuyenteId: this.fb.control<number | null>(null),
    responsabilidadFiscal: this.fb.control<string | null>(null),
    actividadEconomicaId: this.fb.control<number | null>(null),
    sector: this.fb.control<string | null>(null),
    email: this.fb.control<string | null>(null),
    telefono: this.fb.control<string | null>(null),
    celular: this.fb.control<string | null>(null),
    sitioWeb: this.fb.control<string | null>(null),
    municipioId: this.fb.control<number | null>(null),
    direccion: this.fb.control<string | null>(null),
    codigoPostal: this.fb.control<string | null>(null),
    logoUrl: this.fb.control<string | null>(null),
    active: this.fb.nonNullable.control(true),
  });

  constructor() {
    void this.init();
  }

  isInvalid(field: 'nit' | 'razonSocial' | 'tipoPersona'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }

  private async init(): Promise<void> {
    await this.cargarCatalogosBase();
    await this.load();
  }

  private async cargarCatalogosBase(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [tc, ae, pa] = await Promise.all([
        lastValueFrom(this.catalogoService.list('tipo-contribuyente', req)),
        lastValueFrom(this.catalogoService.list('actividad-economica', req)),
        lastValueFrom(this.catalogoService.list('pais', req)),
      ]);
      this.tiposContribuyente.set(tc.data.content);
      this.actividades.set(ae.data.content);
      this.paises.set(pa.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.getActual());
      this.empresaId.set(res.data.id);
      this.frm.patchValue(res.data);
      if (res.data.municipioId != null) {
        await this.preseleccionarUbicacion(res.data.municipioId);
      }
    } catch {
      this.alert.error('No se pudo cargar la información de la empresa');
    } finally {
      this.loading.set(false);
    }
  }

  /** Dado el municipio guardado, fija país y departamento y carga sus listas. */
  private async preseleccionarUbicacion(municipioId: number): Promise<void> {
    try {
      const ubic = await lastValueFrom(this.catalogoService.ubicacionMunicipio(municipioId));
      this.selectedPaisId.set(ubic.data.paisId);
      await this.cargarDepartamentos(ubic.data.paisId);
      this.selectedDepartamentoId.set(ubic.data.departamentoId);
      await this.cargarMunicipios(ubic.data.departamentoId);
    } catch {
      /* municipio sin ubicación resoluble: se deja el cascade vacío */
    }
  }

  async onPaisChange(paisId: number | null): Promise<void> {
    this.selectedPaisId.set(paisId);
    this.selectedDepartamentoId.set(null);
    this.departamentos.set([]);
    this.municipios.set([]);
    this.frm.controls.municipioId.setValue(null);
    if (paisId != null) {
      await this.cargarDepartamentos(paisId);
    }
  }

  async onDepartamentoChange(departamentoId: number | null): Promise<void> {
    this.selectedDepartamentoId.set(departamentoId);
    this.municipios.set([]);
    this.frm.controls.municipioId.setValue(null);
    if (departamentoId != null) {
      await this.cargarMunicipios(departamentoId);
    }
  }

  private async cargarDepartamentos(paisId: number): Promise<void> {
    const res = await lastValueFrom(this.catalogoService.list('departamento', { page: 0, rows: 5000 }, paisId));
    this.departamentos.set(res.data.content);
  }

  private async cargarMunicipios(departamentoId: number): Promise<void> {
    const res = await lastValueFrom(
      this.catalogoService.list('municipio', { page: 0, rows: 5000 }, departamentoId),
    );
    this.municipios.set(res.data.content);
  }

  async save(): Promise<void> {
    const id = this.empresaId();
    if (this.frm.invalid || id == null) {
      this.frm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      await lastValueFrom(this.service.update({ id, ...this.frm.getRawValue() }));
      this.alert.success('Empresa actualizada');
    } catch (e: unknown) {
      this.alert.error(this.extractMessage(e));
    } finally {
      this.saving.set(false);
    }
  }

  private extractMessage(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo guardar la empresa';
  }
}
