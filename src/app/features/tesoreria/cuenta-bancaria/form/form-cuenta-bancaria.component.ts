import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../shared/models/catalogo.model';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { CuentaService } from '../../../contabilidad/cuenta/services/cuenta.service';
import { CuentaTableModel } from '../../../contabilidad/cuenta/models/cuenta.model';
import { CuentaBancariaService } from '../services/cuenta-bancaria.service';
import { CuentaBancariaModel } from '../models/cuenta-bancaria.model';

@Component({
  selector: 'app-form-cuenta-bancaria',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    TerceroSelectorComponent,
  ],
  templateUrl: './form-cuenta-bancaria.component.html',
  styleUrl: './form-cuenta-bancaria.component.css',
})
export class FormCuentaBancariaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CuentaBancariaService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly cuentaService = inject(CuentaService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<CuentaBancariaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly tiposCuenta = signal<CatalogoItem[]>([]);
  readonly cuentas = signal<CuentaTableModel[]>([]);

  /** Tipo de tercero BANCO = 8 (para acotar el buscador de terceros a bancos). */
  readonly bancoTipoId = signal<number>(8);
  readonly showSelector = signal(false);
  readonly bancoNombre = signal<string | null>(null);

  readonly frm = this.fb.group({
    bancoId: this.fb.control<number | null>(null, [Validators.required]),
    tipoCuentaBancariaId: this.fb.control<number | null>(null, [Validators.required]),
    numeroCuenta: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(40)]),
    cuentaContableId: this.fb.control<number | null>(null),
    manejaSobregiro: this.fb.nonNullable.control(false),
    aceptaTransferencias: this.fb.nonNullable.control(false),
    fechaExpiracion: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargarCatalogos();
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [tip, cue] = await Promise.all([
        lastValueFrom(this.catalogoService.list('tipo-cuenta-bancaria', req)),
        lastValueFrom(this.cuentaService.list(req)),
      ]);
      this.tiposCuenta.set(tip.data.content);
      this.cuentas.set(cue.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      bancoId: r?.bancoId ?? null,
      tipoCuentaBancariaId: r?.tipoCuentaBancariaId ?? null,
      numeroCuenta: r?.numeroCuenta ?? '',
      cuentaContableId: r?.cuentaContableId ?? null,
      manejaSobregiro: r?.manejaSobregiro ?? false,
      aceptaTransferencias: r?.aceptaTransferencias ?? false,
      fechaExpiracion: r?.fechaExpiracion ?? null,
    });
    this.bancoNombre.set(r?.bancoNombre ?? null);
  }

  openSelector(): void {
    this.showSelector.set(true);
  }
  onBancoSelected(t: TerceroTableModel): void {
    this.frm.controls.bancoId.setValue(t.id);
    this.bancoNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }

  isInvalid(field: 'bancoId' | 'tipoCuentaBancariaId' | 'numeroCuenta'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
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
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...v }));
      } else {
        await lastValueFrom(this.service.create(v));
      }
      this.alert.success('Cuenta bancaria guardada');
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
    return 'No se pudo guardar la cuenta bancaria';
  }
}
