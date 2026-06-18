import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { CargoService } from '../../cargo/services/cargo.service';
import { CargoTableModel } from '../../cargo/models/cargo.model';
import { GrupoNominaService } from '../../grupo-nomina/services/grupo-nomina.service';
import { GrupoNominaTableModel } from '../../grupo-nomina/models/grupo-nomina.model';
import { VinculacionService } from '../services/vinculacion.service';
import { VinculacionModel } from '../models/vinculacion.model';

@Component({
  selector: 'app-form-vinculacion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    TextareaModule,
  ],
  templateUrl: './form-vinculacion.component.html',
  styleUrl: './form-vinculacion.component.css',
})
export class FormVinculacionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(VinculacionService);
  private readonly terceroService = inject(TerceroService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly cargoService = inject(CargoService);
  private readonly grupoService = inject(GrupoNominaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<VinculacionModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly empleados = signal<TerceroTableModel[]>([]);
  readonly cargos = signal<CargoTableModel[]>([]);
  readonly grupos = signal<GrupoNominaTableModel[]>([]);

  readonly tiposContrato = [
    { label: 'Término indefinido', value: 'termino_indefinido' },
    { label: 'Término fijo', value: 'termino_fijo' },
    { label: 'Obra o labor', value: 'obra_labor' },
    { label: 'Prestación de servicios', value: 'prestacion_servicios' },
    { label: 'Aprendizaje', value: 'aprendizaje' },
  ];
  readonly estados = [
    { label: 'Activa', value: 'activa' },
    { label: 'Suspendida', value: 'suspendida' },
    { label: 'Terminada', value: 'terminada' },
  ];
  readonly frecuencias = [
    { label: 'Mensual', value: 'mensual' },
    { label: 'Quincenal', value: 'quincenal' },
    { label: 'Semanal', value: 'semanal' },
  ];

  readonly frm = this.fb.group({
    empleadoId: this.fb.control<number | null>(null, [Validators.required]),
    cargoId: this.fb.control<number | null>(null),
    grupoNominaId: this.fb.control<number | null>(null),
    codigo: this.fb.control<string | null>(null),
    fecha: this.fb.control<string | null>(null),
    fechaFin: this.fb.control<string | null>(null),
    tipoVinculacion: this.fb.control<string | null>(null),
    tipoContrato: this.fb.control<string | null>(null),
    sueldo: this.fb.control<number | null>(null),
    horaTrabajo: this.fb.control<number | null>(null),
    frecuenciaPago: this.fb.control<string | null>(null),
    tipoCotizante: this.fb.control<string | null>(null),
    estadoVinculacion: this.fb.control<string | null>('activa'),
    objeto: this.fb.control<string | null>(null),
    periodoPrueba: this.fb.nonNullable.control(false),
    temporal: this.fb.nonNullable.control(false),
  });

  constructor() {
    void this.cargarCatalogos();
  }

  /** Resetea el formulario al abrir el diálogo (no en un effect, para no resetear al interactuar con los selects). */
  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      empleadoId: r?.empleadoId ?? null,
      cargoId: r?.cargoId ?? null,
      grupoNominaId: r?.grupoNominaId ?? null,
      codigo: r?.codigo ?? null,
      fecha: r?.fecha ?? null,
      fechaFin: r?.fechaFin ?? null,
      tipoVinculacion: r?.tipoVinculacion ?? null,
      tipoContrato: r?.tipoContrato ?? null,
      sueldo: r?.sueldo ?? null,
      horaTrabajo: r?.horaTrabajo ?? null,
      frecuenciaPago: r?.frecuenciaPago ?? null,
      tipoCotizante: r?.tipoCotizante ?? null,
      estadoVinculacion: r?.estadoVinculacion ?? 'activa',
      objeto: r?.objeto ?? null,
      periodoPrueba: r?.periodoPrueba ?? false,
      temporal: r?.temporal ?? false,
    });
  }

  isInvalid(field: 'empleadoId'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }
  close(): void {
    this.visible.set(false);
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 1000 };
    try {
      const tt = await lastValueFrom(this.catalogoService.list('tipo-tercero', { page: 0, rows: 500 }));
      const empTipoId = tt.data.content.find((t) => t.codigo === 'EMPLEADO')?.id ?? null;
      const [emp, car, gru] = await Promise.all([
        lastValueFrom(this.terceroService.list({ ...req, params: { tipoTerceroId: empTipoId } })),
        lastValueFrom(this.cargoService.list(req)),
        lastValueFrom(this.grupoService.list(req)),
      ]);
      this.empleados.set(emp.data.content);
      this.cargos.set(car.data.content);
      this.grupos.set(gru.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('El empleado es obligatorio');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      const payload = { ...v, empleadoId: v.empleadoId as number };
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...payload }));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.alert.success('Vinculación guardada');
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
    return 'No se pudo guardar la vinculación';
  }
}
