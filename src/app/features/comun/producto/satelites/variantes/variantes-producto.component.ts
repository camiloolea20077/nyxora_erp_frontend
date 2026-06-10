import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../../shared/services/alert.service';
import { ProductoSatelitesService } from '../services/producto-satelites.service';
import { VarianteModel } from '../models/producto-satelite.model';

@Component({
  selector: 'app-variantes-producto',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TableModule, ButtonModule, InputTextModule, InputNumberModule, DialogModule, TagModule],
  templateUrl: './variantes-producto.component.html',
  styleUrl: './variantes-producto.component.css',
})
export class VariantesProductoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductoSatelitesService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly productoId = input.required<number>();

  readonly items = signal<VarianteModel[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<VarianteModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly frm = this.fb.group({
    skuPlu: this.fb.control<string | null>(null),
    codigoBarra: this.fb.control<string | null>(null),
    precioAdicional: this.fb.control<number | null>(0),
    costo: this.fb.control<number | null>(0),
  });

  constructor() {
    effect(() => {
      if (this.productoId()) void this.load();
    });
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listVariantes(this.productoId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset({ skuPlu: null, codigoBarra: null, precioAdicional: 0, costo: 0 });
    this.showForm.set(true);
  }
  editar(row: VarianteModel): void {
    this.editing.set(row);
    this.frm.reset({
      skuPlu: row.skuPlu,
      codigoBarra: row.codigoBarra,
      precioAdicional: row.precioAdicional,
      costo: row.costo,
    });
    this.showForm.set(true);
  }
  close(): void {
    this.showForm.set(false);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const v = this.frm.getRawValue();
      const r = this.editing();
      if (r) {
        await lastValueFrom(this.service.updateVariante(this.productoId(), { id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.createVariante(this.productoId(), v));
      }
      this.alert.success('Variante guardada');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar la variante');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: VarianteModel): void {
    this.confirm.confirm({
      message: '¿Eliminar esta variante?',
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
      await lastValueFrom(this.service.deleteVariante(this.productoId(), id));
      this.alert.success('Variante eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la variante');
    }
  }
}
