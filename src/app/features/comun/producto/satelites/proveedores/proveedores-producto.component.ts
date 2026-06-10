import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../../shared/services/alert.service';
import { TerceroSelectorComponent } from '../../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../tercero/models/tercero.model';
import { ProductoSatelitesService } from '../services/producto-satelites.service';
import { ProveedorModel } from '../models/producto-satelite.model';

@Component({
  selector: 'app-proveedores-producto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    TerceroSelectorComponent,
  ],
  templateUrl: './proveedores-producto.component.html',
  styleUrl: './proveedores-producto.component.css',
})
export class ProveedoresProductoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductoSatelitesService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly productoId = input.required<number>();

  readonly items = signal<ProveedorModel[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<ProveedorModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly showSelector = signal(false);
  readonly proveedorNombre = signal<string | null>(null);

  readonly frm = this.fb.group({
    proveedorId: this.fb.control<number | null>(null, [Validators.required]),
    codigoProducto: this.fb.control<string | null>(null),
    cantidadMinima: this.fb.control<number | null>(null),
    plazoEntrega: this.fb.control<number | null>(null),
  });

  constructor() {
    effect(() => {
      if (this.productoId()) void this.load();
    });
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listProveedores(this.productoId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.proveedorNombre.set(null);
    this.frm.reset({ proveedorId: null, codigoProducto: null, cantidadMinima: null, plazoEntrega: null });
    this.showForm.set(true);
  }
  editar(row: ProveedorModel): void {
    this.editing.set(row);
    this.proveedorNombre.set(row.proveedorId ? `Proveedor #${row.proveedorId}` : null);
    this.frm.reset({
      proveedorId: row.proveedorId,
      codigoProducto: row.codigoProducto,
      cantidadMinima: row.cantidadMinima,
      plazoEntrega: row.plazoEntrega,
    });
    this.showForm.set(true);
  }
  close(): void {
    this.showForm.set(false);
  }

  openSelector(): void {
    this.showSelector.set(true);
  }
  onProveedorSelected(t: TerceroTableModel): void {
    this.frm.controls.proveedorId.setValue(t.id);
    this.proveedorNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Selecciona el proveedor');
      return;
    }
    this.saving.set(true);
    try {
      const v = this.frm.getRawValue();
      const r = this.editing();
      if (r) {
        await lastValueFrom(this.service.updateProveedor(this.productoId(), { id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.createProveedor(this.productoId(), v));
      }
      this.alert.success('Proveedor guardado');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar el proveedor');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: ProveedorModel): void {
    this.confirm.confirm({
      message: '¿Quitar este proveedor del producto?',
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
      await lastValueFrom(this.service.deleteProveedor(this.productoId(), id));
      this.alert.success('Proveedor eliminado');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar el proveedor');
    }
  }
}
