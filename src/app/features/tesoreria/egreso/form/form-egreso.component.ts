import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../shared/models/catalogo.model';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { EgresoService } from '../services/egreso.service';
import { CuentaBancariaService } from '../../cuenta-bancaria/services/cuenta-bancaria.service';
import { CuentaBancariaTableModel } from '../../cuenta-bancaria/models/cuenta-bancaria.model';
import { ObligacionPagoService } from '../../../cuentas-pagar/obligacion-pago/services/obligacion-pago.service';

interface ObligacionOpt {
  id: number;
  label: string;
}

@Component({
  selector: 'app-form-egreso',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule, TerceroSelectorComponent],
  templateUrl: './form-egreso.component.html',
  styleUrl: './form-egreso.component.css',
})
export class FormEgresoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EgresoService);
  private readonly cuentaBancariaService = inject(CuentaBancariaService);
  private readonly obligacionService = inject(ObligacionPagoService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly cuentas = signal<CuentaBancariaTableModel[]>([]);
  readonly formasPago = signal<CatalogoItem[]>([]);
  readonly obligaciones = signal<ObligacionOpt[]>([]);

  readonly showSelector = signal(false);
  readonly beneficiarioNombre = signal<string | null>(null);

  readonly frm = this.fb.group({
    cuentaBancariaId: this.fb.control<number | null>(null),
    beneficiarioId: this.fb.control<number | null>(null, [Validators.required]),
    formaPagoId: this.fb.control<number | null>(null),
    numero: this.fb.control<string | null>(null),
    fecha: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [Validators.required]),
    valor: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    numeroCheque: this.fb.control<string | null>(null),
    descripcion: this.fb.control<string | null>(null),
    obligacionPagoId: this.fb.control<number | null>(null),
  });

  constructor() {
    void this.cargarCatalogos();
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 5000 };
    try {
      const [cb, fp, ob] = await Promise.all([
        lastValueFrom(this.cuentaBancariaService.list(req)),
        lastValueFrom(this.catalogoService.list('forma-pago', req)),
        lastValueFrom(this.obligacionService.list(req)),
      ]);
      this.cuentas.set(cb.data.content);
      this.formasPago.set(fp.data.content);
      this.obligaciones.set(
        ob.data.content
          .filter((o) => (o.saldo ?? 0) > 0 && o.estado !== 'anulada' && o.estado !== 'pagada')
          .map((o) => ({ id: o.id, label: `${o.numero ?? '#' + o.id} · saldo ${formatNum(o.saldo)}` })),
      );
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  openSelector(): void {
    this.showSelector.set(true);
  }
  onBeneficiarioSelected(t: TerceroTableModel): void {
    this.frm.controls.beneficiarioId.setValue(t.id);
    this.beneficiarioNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }

  volver(): void {
    void this.router.navigate(['/egresos']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Completa beneficiario, fecha y valor');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      await lastValueFrom(this.service.create({ ...v, tipoDocumentoId: null }));
      this.alert.success('Egreso creado (borrador)');
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
    return 'No se pudo guardar el egreso';
  }
}

function formatNum(v: number | null): string {
  return new Intl.NumberFormat('es-CO').format(v ?? 0);
}
