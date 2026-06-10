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
import { CuentaModel } from '../models/tercero-satelite.model';

@Component({
  selector: 'app-cuentas-tercero',
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
  templateUrl: './cuentas-tercero.component.html',
  styleUrl: './cuentas-tercero.component.css',
})
export class CuentasTerceroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TerceroSatelitesService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly terceroId = input.required<number>();

  readonly items = signal<CuentaModel[]>([]);
  readonly bancos = signal<CatalogoItem[]>([]);
  readonly tiposCuenta = signal<CatalogoItem[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly editing = signal<CuentaModel | null>(null);
  readonly isEdit = computed(() => !!this.editing());

  readonly frm = this.fb.group({
    bancoId: this.fb.control<number | null>(null, [Validators.required]),
    tipoCuentaBancariaId: this.fb.control<number | null>(null, [Validators.required]),
    numeroCuenta: this.fb.control<string | null>(null, [Validators.required]),
    principal: this.fb.nonNullable.control(false),
  });

  constructor() {
    void this.cargarCatalogos();
    effect(() => {
      if (this.terceroId()) void this.load();
    });
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [b, tc] = await Promise.all([
        lastValueFrom(this.catalogoService.list('banco', req)),
        lastValueFrom(this.catalogoService.list('tipo-cuenta-bancaria', req)),
      ]);
      this.bancos.set(b.data.content);
      this.tiposCuenta.set(tc.data.content);
    } catch {
      this.bancos.set([]);
      this.tiposCuenta.set([]);
    }
  }

  nombreBanco(id: number | null): string {
    if (id == null) return '';
    return this.bancos().find((b) => b.id === id)?.nombre ?? '';
  }
  nombreTipoCuenta(id: number | null): string {
    if (id == null) return '';
    return this.tiposCuenta().find((t) => t.id === id)?.nombre ?? '';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listCuentas(this.terceroId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  nuevo(): void {
    this.editing.set(null);
    this.frm.reset({ bancoId: null, tipoCuentaBancariaId: null, numeroCuenta: null, principal: false });
    this.showForm.set(true);
  }
  editar(row: CuentaModel): void {
    this.editing.set(row);
    this.frm.reset({
      bancoId: row.bancoId,
      tipoCuentaBancariaId: row.tipoCuentaBancariaId,
      numeroCuenta: row.numeroCuenta,
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
        await lastValueFrom(this.service.updateCuenta(this.terceroId(), { id: r.id, active: r.active, ...v }));
      } else {
        await lastValueFrom(this.service.createCuenta(this.terceroId(), v));
      }
      this.alert.success('Cuenta guardada');
      this.close();
      this.load();
    } catch {
      this.alert.error('No se pudo guardar la cuenta');
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: CuentaModel): void {
    this.confirm.confirm({
      message: '¿Eliminar esta cuenta bancaria?',
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
      await lastValueFrom(this.service.deleteCuenta(this.terceroId(), id));
      this.alert.success('Cuenta eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la cuenta');
    }
  }
}
