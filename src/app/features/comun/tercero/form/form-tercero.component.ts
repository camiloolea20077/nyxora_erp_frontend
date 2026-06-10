import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../shared/models/catalogo.model';
import { TerceroService } from '../services/tercero.service';
import { TerceroModel } from '../models/tercero.model';
import { ContactosTerceroComponent } from '../satelites/contactos/contactos-tercero.component';
import { DireccionesTerceroComponent } from '../satelites/direcciones/direcciones-tercero.component';
import { CuentasTerceroComponent } from '../satelites/cuentas/cuentas-tercero.component';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form-tercero',
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
    TabsModule,
    ConfirmDialogModule,
    ContactosTerceroComponent,
    DireccionesTerceroComponent,
    CuentasTerceroComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './form-tercero.component.html',
  styleUrl: './form-tercero.component.css',
})
export class FormTerceroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TerceroService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly terceroId = signal<number | null>(null);
  readonly isEdit = computed(() => this.terceroId() != null);
  readonly tipoPersona = signal('natural');
  /** Códigos de los tipos de tercero seleccionados (CLIENTE, PROVEEDOR, BANCO…) → manejan qué secciones se ven. */
  readonly tipoCodes = signal<string[]>([]);
  readonly mostrarFiscalComercial = computed(
    () => this.tipoCodes().includes('CLIENTE') || this.tipoCodes().includes('PROVEEDOR'),
  );
  private registro: TerceroModel | null = null;

  // Catálogos
  readonly tiposIdentificacion = signal<CatalogoItem[]>([]);
  readonly actividades = signal<CatalogoItem[]>([]);
  readonly tiposContribuyente = signal<CatalogoItem[]>([]);
  readonly condicionesPago = signal<CatalogoItem[]>([]);
  readonly formasPago = signal<CatalogoItem[]>([]);
  readonly tiposTercero = signal<CatalogoItem[]>([]);
  // Cascade geográfico
  readonly paises = signal<CatalogoItem[]>([]);
  readonly departamentos = signal<CatalogoItem[]>([]);
  readonly municipios = signal<CatalogoItem[]>([]);
  readonly selectedPaisId = signal<number | null>(null);
  readonly selectedDepartamentoId = signal<number | null>(null);

  readonly tiposPersona: Opcion[] = [
    { label: 'Natural', value: 'natural' },
    { label: 'Jurídica', value: 'juridica' },
  ];

  readonly frm = this.fb.group({
    tipoIdentificacionId: this.fb.control<number | null>(null, [Validators.required]),
    numeroDocumento: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(30)]),
    digitoVerificacion: this.fb.control<number | null>(null),
    tipoPersona: this.fb.nonNullable.control('natural', [Validators.required]),
    primerNombre: this.fb.control<string | null>(null),
    segundoNombre: this.fb.control<string | null>(null),
    primerApellido: this.fb.control<string | null>(null),
    segundoApellido: this.fb.control<string | null>(null),
    razonSocial: this.fb.control<string | null>(null),
    nombreComercial: this.fb.control<string | null>(null),
    nombreRepresentanteLegal: this.fb.control<string | null>(null),
    documentoRepresentanteLegal: this.fb.control<string | null>(null),
    fechaNacimiento: this.fb.control<string | null>(null),
    municipioId: this.fb.control<number | null>(null),
    direccion: this.fb.control<string | null>(null),
    sitioWeb: this.fb.control<string | null>(null),
    actividadEconomicaId: this.fb.control<number | null>(null),
    tipoContribuyenteId: this.fb.control<number | null>(null),
    responsableIva: this.fb.nonNullable.control(false),
    esAutoretenedorIva: this.fb.nonNullable.control(false),
    esAutoretenedorIca: this.fb.nonNullable.control(false),
    esAutoretenedorFuente: this.fb.nonNullable.control(false),
    declarante: this.fb.nonNullable.control(false),
    aplicaArt383: this.fb.nonNullable.control(false),
    tieneRut: this.fb.nonNullable.control(false),
    condicionPagoClienteId: this.fb.control<number | null>(null),
    condicionPagoProveedorId: this.fb.control<number | null>(null),
    formaPagoClienteId: this.fb.control<number | null>(null),
    formaPagoProveedorId: this.fb.control<number | null>(null),
    interesEfectivoMensual: this.fb.control<number | null>(null),
    observaciones: this.fb.control<string | null>(null),
    tipoTerceroId: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.terceroId.set(idParam ? Number(idParam) : null);
    void this.init();
  }

  isInvalid(field: 'tipoIdentificacionId' | 'numeroDocumento' | 'tipoTerceroId'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }

  onTipoPersonaChange(value: string): void {
    this.tipoPersona.set(value);
  }

  onTipoChange(id: number | null): void {
    this.tipoCodes.set(id != null ? this.codeFor(id) : []);
  }

  private codeFor(id: number): string[] {
    const t = this.tiposTercero().find((x) => x.id === id);
    return t ? [t.codigo] : [];
  }

  private async init(): Promise<void> {
    await this.cargarCatalogos();
    const id = this.terceroId();
    if (id != null) {
      try {
        const res = await lastValueFrom(this.service.getById(id));
        this.registro = res.data;
        await this.aplicar(res.data);
      } catch {
        this.alert.error('No se pudo cargar el tercero');
        this.volver();
      }
    }
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [ti, ae, tc, cp, fp, tt, pa] = await Promise.all([
        lastValueFrom(this.catalogoService.list('tipo-identificacion', req)),
        lastValueFrom(this.catalogoService.list('actividad-economica', req)),
        lastValueFrom(this.catalogoService.list('tipo-contribuyente', req)),
        lastValueFrom(this.catalogoService.list('condicion-pago', req)),
        lastValueFrom(this.catalogoService.list('forma-pago', req)),
        lastValueFrom(this.catalogoService.list('tipo-tercero', req)),
        lastValueFrom(this.catalogoService.list('pais', req)),
      ]);
      this.tiposIdentificacion.set(ti.data.content);
      this.actividades.set(ae.data.content);
      this.tiposContribuyente.set(tc.data.content);
      this.condicionesPago.set(cp.data.content);
      this.formasPago.set(fp.data.content);
      this.tiposTercero.set(tt.data.content);
      this.paises.set(pa.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  private async aplicar(r: TerceroModel): Promise<void> {
    this.frm.reset({
      tipoIdentificacionId: r.tipoIdentificacionId,
      numeroDocumento: r.numeroDocumento,
      digitoVerificacion: r.digitoVerificacion,
      tipoPersona: r.tipoPersona,
      primerNombre: r.primerNombre,
      segundoNombre: r.segundoNombre,
      primerApellido: r.primerApellido,
      segundoApellido: r.segundoApellido,
      razonSocial: r.razonSocial,
      nombreComercial: r.nombreComercial,
      nombreRepresentanteLegal: r.nombreRepresentanteLegal,
      documentoRepresentanteLegal: r.documentoRepresentanteLegal,
      fechaNacimiento: r.fechaNacimiento,
      municipioId: r.municipioId,
      direccion: r.direccion,
      sitioWeb: r.sitioWeb,
      actividadEconomicaId: r.actividadEconomicaId,
      tipoContribuyenteId: r.tipoContribuyenteId,
      responsableIva: r.responsableIva ?? false,
      esAutoretenedorIva: r.esAutoretenedorIva ?? false,
      esAutoretenedorIca: r.esAutoretenedorIca ?? false,
      esAutoretenedorFuente: r.esAutoretenedorFuente ?? false,
      declarante: r.declarante ?? false,
      aplicaArt383: r.aplicaArt383 ?? false,
      tieneRut: r.tieneRut ?? false,
      condicionPagoClienteId: r.condicionPagoClienteId,
      condicionPagoProveedorId: r.condicionPagoProveedorId,
      formaPagoClienteId: r.formaPagoClienteId,
      formaPagoProveedorId: r.formaPagoProveedorId,
      interesEfectivoMensual: r.interesEfectivoMensual,
      observaciones: r.observaciones,
      tipoTerceroId: r.tipoTerceroIds?.[0] ?? null,
    });
    this.tipoPersona.set(r.tipoPersona);
    this.tipoCodes.set(r.tipoTerceroIds?.length ? this.codeFor(r.tipoTerceroIds[0]) : []);
    if (r.municipioId != null) {
      await this.preseleccionarUbicacion(r.municipioId);
    }
  }

  // ── Cascade geográfico ──
  private async preseleccionarUbicacion(municipioId: number): Promise<void> {
    try {
      const ubic = await lastValueFrom(this.catalogoService.ubicacionMunicipio(municipioId));
      this.selectedPaisId.set(ubic.data.paisId);
      await this.cargarDepartamentos(ubic.data.paisId);
      this.selectedDepartamentoId.set(ubic.data.departamentoId);
      await this.cargarMunicipios(ubic.data.departamentoId);
    } catch {
      /* sin ubicación resoluble */
    }
  }
  async onPaisChange(paisId: number | null): Promise<void> {
    this.selectedPaisId.set(paisId);
    this.selectedDepartamentoId.set(null);
    this.departamentos.set([]);
    this.municipios.set([]);
    this.frm.controls.municipioId.setValue(null);
    if (paisId != null) await this.cargarDepartamentos(paisId);
  }
  async onDepartamentoChange(departamentoId: number | null): Promise<void> {
    this.selectedDepartamentoId.set(departamentoId);
    this.municipios.set([]);
    this.frm.controls.municipioId.setValue(null);
    if (departamentoId != null) await this.cargarMunicipios(departamentoId);
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

  volver(): void {
    void this.router.navigate(['/terceros']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Revisa los campos obligatorios (identificación)');
      return;
    }
    this.loading.set(true);
    try {
      const { tipoTerceroId, ...rest } = this.frm.getRawValue();
      const tipoTerceroIds = tipoTerceroId != null ? [tipoTerceroId] : [];
      const r = this.registro;
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...rest, tipoTerceroIds }));
      } else {
        await lastValueFrom(this.service.create({ ...rest, tipoTerceroIds }));
      }
      this.alert.success('Tercero guardado');
      this.volver();
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
    return 'No se pudo guardar el tercero';
  }
}
