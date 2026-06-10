import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../shared/models/catalogo.model';

interface CatalogoOpcion {
  slug: string;
  label: string;
}

@Component({
  selector: 'app-index-catalogo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-catalogo.component.html',
  styleUrl: './index-catalogo.component.css',
})
export class IndexCatalogoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CatalogoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly catalogos: CatalogoOpcion[] = [
    { slug: 'tipo-identificacion', label: 'Tipos de identificación' },
    { slug: 'tipo-tercero', label: 'Tipos de tercero' },
    { slug: 'tipo-contribuyente', label: 'Tipos de contribuyente' },
    { slug: 'actividad-economica', label: 'Actividades económicas' },
    { slug: 'condicion-pago', label: 'Condiciones de pago' },
    { slug: 'forma-pago', label: 'Formas de pago' },
    { slug: 'banco', label: 'Bancos' },
    { slug: 'tipo-cuenta-bancaria', label: 'Tipos de cuenta bancaria' },
    { slug: 'unidad-medida', label: 'Unidades de medida' },
  ];

  catalogo = this.catalogos[0].slug;
  readonly catalogoLabel = computed(() => this.catalogos.find((c) => c.slug === this._cat())?.label ?? '');
  private readonly _cat = signal(this.catalogos[0].slug);

  readonly rows = signal<CatalogoItem[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';

  readonly showForm = signal(false);
  readonly editing = signal<CatalogoItem | null>(null);
  readonly saving = signal(false);
  readonly isEdit = computed(() => !!this.editing());

  readonly frm = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    activo: this.fb.nonNullable.control(true),
  });

  onCatalogoChange(slug: string): void {
    this._cat.set(slug);
    this.page.set(0);
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(
        this.service.list(this._cat(), { page: this.page(), rows: this.pageSize(), search: this.search || null }, null, false),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar el catálogo');
    } finally {
      this.loading.set(false);
    }
  }

  onLazy(e: TableLazyLoadEvent): void {
    const rows = e.rows ?? 10;
    this.pageSize.set(rows);
    this.page.set(Math.floor((e.first ?? 0) / rows));
    this.load();
  }
  onSearch(): void {
    this.page.set(0);
    this.load();
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset({ codigo: '', nombre: '', activo: true });
    this.showForm.set(true);
  }
  editar(row: CatalogoItem): void {
    this.editing.set(row);
    this.frm.reset({ codigo: row.codigo, nombre: row.nombre, activo: row.active });
    this.showForm.set(true);
  }
  close(): void {
    this.showForm.set(false);
  }

  isInvalid(field: 'codigo' | 'nombre'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
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
        await lastValueFrom(this.service.update(this._cat(), { id: r.id, ...v }));
      } else {
        await lastValueFrom(this.service.create(this._cat(), v));
      }
      this.alert.success('Ítem guardado');
      this.close();
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: CatalogoItem): void {
    this.confirm.confirm({
      message: `¿Eliminar "${row.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doDelete(row.id),
    });
  }
  private async doDelete(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.delete(this._cat(), id));
      this.alert.success('Ítem eliminado');
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo completar la operación';
  }
}
