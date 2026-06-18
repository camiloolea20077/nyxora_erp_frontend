import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged, filter, lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { ActivoFijoService } from '../services/activo-fijo.service';
import { ActivoFijoModel } from '../models/activo-fijo.model';
import { toObservable } from '@angular/core/rxjs-interop';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form-activo-fijo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    TerceroSelectorComponent,
  ],
  templateUrl: './form-activo-fijo.component.html',
  styleUrl: './form-activo-fijo.component.css',
})
export class FormActivoFijoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ActivoFijoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<ActivoFijoModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly showSelector = signal(false);
  readonly proveedorNombre = signal<string | null>(null);

  readonly metodos: Opcion[] = [
    { label: 'Línea recta', value: 'linea_recta' },
    { label: 'Saldos decrecientes', value: 'saldos_decrecientes' },
    { label: 'Unidades de producción', value: 'unidades_produccion' },
  ];
  readonly estados: Opcion[] = [
    { label: 'Activo', value: 'activo' },
    { label: 'En mantenimiento', value: 'en_mantenimiento' },
    { label: 'En reparación', value: 'en_reparacion' },
    { label: 'Dado de baja', value: 'dado_de_baja' },
  ];

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(40)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
    numeroSerie: this.fb.control<string | null>(null),
    modelo: this.fb.control<string | null>(null),
    codigoUnspsc: this.fb.control<string | null>(null),
    codigoBarra: this.fb.control<string | null>(null),
    proveedorId: this.fb.control<number | null>(null),
    numeroFactura: this.fb.control<string | null>(null),
    fechaFactura: this.fb.control<string | null>(null),
    valorCompra: this.fb.control<number | null>(null),
    valorSalvamento: this.fb.control<number | null>(null),
    porcentajeSalvamento: this.fb.control<number | null>(null),
    deterioro: this.fb.control<number | null>(null),
    avaluo: this.fb.control<number | null>(null),
    capitalizado: this.fb.control<number | null>(null),
    vidaUtil: this.fb.control<number | null>(null),
    metodoDepreciacion: this.fb.control<string | null>(null),
    tipoDepreciacion: this.fb.control<string | null>(null),
    estadoActivo: this.fb.control<string | null>('activo'),
    descripcion: this.fb.control<string | null>(null),
  });

  constructor() {
    toObservable(this.visible)
      .pipe(
        filter((v) => v),
        distinctUntilChanged(),
      )
      .subscribe(() => this.resetForm());
  }
  private resetForm(): void {
    const r = this.registro();
    this.frm.reset({
      codigo: r?.codigo ?? '',
      nombre: r?.nombre ?? '',
      numeroSerie: r?.numeroSerie ?? null,
      modelo: r?.modelo ?? null,
      codigoUnspsc: r?.codigoUnspsc ?? null,
      codigoBarra: r?.codigoBarra ?? null,
      proveedorId: r?.proveedorId ?? null,
      numeroFactura: r?.numeroFactura ?? null,
      fechaFactura: r?.fechaFactura ?? null,
      valorCompra: r?.valorCompra ?? null,
      valorSalvamento: r?.valorSalvamento ?? null,
      porcentajeSalvamento: r?.porcentajeSalvamento ?? null,
      deterioro: r?.deterioro ?? null,
      avaluo: r?.avaluo ?? null,
      capitalizado: r?.capitalizado ?? null,
      vidaUtil: r?.vidaUtil ?? null,
      metodoDepreciacion: r?.metodoDepreciacion ?? null,
      tipoDepreciacion: r?.tipoDepreciacion ?? null,
      estadoActivo: r?.estadoActivo ?? 'activo',
      descripcion: r?.descripcion ?? null,
    });
    this.proveedorNombre.set(r?.proveedorNombre ?? null);
  }
  isInvalid(field: 'codigo' | 'nombre'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }
  openSelector(): void {
    this.showSelector.set(true);
  }
  onProveedorSelected(t: TerceroTableModel): void {
    this.frm.controls.proveedorId.setValue(t.id);
    this.proveedorNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }
  limpiarProveedor(): void {
    this.frm.controls.proveedorId.setValue(null);
    this.proveedorNombre.set(null);
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
      const dto = {
        ...v,
        productoId: null,
        marcaId: null,
        unidadMayorId: null,
        bodegaId: null,
        centroCostoId: null,
        fechaSalidaServicio: null,
      };
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...dto }));
      } else {
        await lastValueFrom(this.service.create(dto));
      }
      this.alert.success('Activo fijo guardado');
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
    return 'No se pudo guardar el activo fijo';
  }
}
