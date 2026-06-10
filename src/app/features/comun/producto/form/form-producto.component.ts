import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../shared/models/catalogo.model';
import { ProductoService } from '../services/producto.service';
import { ProductoModel } from '../models/producto.model';
import { CategoriaService } from '../../categoria/services/categoria.service';
import { CategoriaTableModel } from '../../categoria/models/categoria.model';
import { ImpuestoService } from '../../impuesto/services/impuesto.service';
import { ImpuestoTableModel } from '../../impuesto/models/impuesto.model';
import { RecursoService } from '../../recurso/services/recurso.service';
import { RecursoTableModel } from '../../recurso/models/recurso.model';
import { VariantesProductoComponent } from '../satelites/variantes/variantes-producto.component';
import { ProveedoresProductoComponent } from '../satelites/proveedores/proveedores-producto.component';

interface Opcion {
  label: string;
  value: string;
}

@Component({
  selector: 'app-form-producto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    TabsModule,
    ConfirmDialogModule,
    VariantesProductoComponent,
    ProveedoresProductoComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './form-producto.component.html',
  styleUrl: './form-producto.component.css',
})
export class FormProductoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductoService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly impuestoService = inject(ImpuestoService);
  private readonly recursoService = inject(RecursoService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly productoId = signal<number | null>(null);
  readonly isEdit = computed(() => this.productoId() != null);
  private registro: ProductoModel | null = null;

  readonly categorias = signal<CategoriaTableModel[]>([]);
  readonly unidades = signal<CatalogoItem[]>([]);
  readonly impuestos = signal<ImpuestoTableModel[]>([]);
  readonly recursos = signal<RecursoTableModel[]>([]);

  readonly tipos: Opcion[] = [
    { label: 'Bien', value: 'bien' },
    { label: 'Servicio', value: 'servicio' },
  ];

  readonly frm = this.fb.group({
    categoriaId: this.fb.control<number | null>(null),
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(30)]),
    codigoUnspsc: this.fb.control<string | null>(null),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
    descripcion: this.fb.control<string | null>(null),
    tipo: this.fb.nonNullable.control('bien', [Validators.required]),
    esCompuesto: this.fb.nonNullable.control(false),
    unidadMayorId: this.fb.control<number | null>(null),
    unidadMenorId: this.fb.control<number | null>(null),
    contenido: this.fb.control<number | null>(null),
    manejaInventario: this.fb.nonNullable.control(true),
    manejaLote: this.fb.nonNullable.control(false),
    manejaDesperdicio: this.fb.nonNullable.control(false),
    esDevolutivo: this.fb.nonNullable.control(false),
    stockMinimo: this.fb.control<number | null>(null),
    stockMaximo: this.fb.control<number | null>(null),
    tiempoReabastecimiento: this.fb.control<number | null>(null),
    impuestoId: this.fb.control<number | null>(null),
    discriminaIva: this.fb.nonNullable.control(false),
    aplicaImpuestoBolsa: this.fb.nonNullable.control(false),
    tarifaMaxima: this.fb.control<number | null>(null),
    esPos: this.fb.nonNullable.control(false),
    recursoId: this.fb.control<number | null>(null),
    impuestoIds: this.fb.nonNullable.control<number[]>([]),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productoId.set(idParam ? Number(idParam) : null);
    void this.init();
  }

  isInvalid(field: 'codigo' | 'nombre'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }

  private async init(): Promise<void> {
    await this.cargarCatalogos();
    const id = this.productoId();
    if (id != null) {
      try {
        const res = await lastValueFrom(this.service.getById(id));
        const d = res.data;
        this.registro = d;
        this.frm.reset({
          categoriaId: d.categoriaId,
          codigo: d.codigo,
          codigoUnspsc: d.codigoUnspsc,
          nombre: d.nombre,
          descripcion: d.descripcion,
          tipo: d.tipo,
          esCompuesto: d.esCompuesto ?? false,
          unidadMayorId: d.unidadMayorId,
          unidadMenorId: d.unidadMenorId,
          contenido: d.contenido,
          manejaInventario: d.manejaInventario ?? true,
          manejaLote: d.manejaLote ?? false,
          manejaDesperdicio: d.manejaDesperdicio ?? false,
          esDevolutivo: d.esDevolutivo ?? false,
          stockMinimo: d.stockMinimo,
          stockMaximo: d.stockMaximo,
          tiempoReabastecimiento: d.tiempoReabastecimiento,
          impuestoId: d.impuestoId,
          discriminaIva: d.discriminaIva ?? false,
          aplicaImpuestoBolsa: d.aplicaImpuestoBolsa ?? false,
          tarifaMaxima: d.tarifaMaxima,
          esPos: d.esPos ?? false,
          recursoId: d.recursoId,
          impuestoIds: d.impuestoIds ?? [],
        });
      } catch {
        this.alert.error('No se pudo cargar el producto');
        this.volver();
      }
    }
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [cat, uni, imp, rec] = await Promise.all([
        lastValueFrom(this.categoriaService.list(req)),
        lastValueFrom(this.catalogoService.list('unidad-medida', req)),
        lastValueFrom(this.impuestoService.list(req)),
        lastValueFrom(this.recursoService.list(req)),
      ]);
      this.categorias.set(cat.data.content);
      this.unidades.set(uni.data.content);
      this.impuestos.set(imp.data.content);
      this.recursos.set(rec.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  volver(): void {
    void this.router.navigate(['/productos']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Revisa los campos obligatorios (código y nombre)');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      const r = this.registro;
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.create(v));
      }
      this.alert.success('Producto guardado');
      this.volver();
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
    return 'No se pudo guardar el producto';
  }
}
