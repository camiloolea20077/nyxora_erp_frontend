import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { AlertService } from '../../../../shared/services/alert.service';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { FacturaProveedorService } from '../services/factura-proveedor.service';

@Component({
  selector: 'app-form-factura-proveedor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TerceroSelectorComponent,
  ],
  templateUrl: './form-factura-proveedor.component.html',
  styleUrl: './form-factura-proveedor.component.css',
})
export class FormFacturaProveedorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FacturaProveedorService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly showSelector = signal(false);
  readonly proveedorNombre = signal<string | null>(null);

  readonly frm = this.fb.group({
    proveedorId: this.fb.control<number | null>(null, [Validators.required]),
    numeroDocumento: this.fb.control<string | null>(null),
    cufe: this.fb.control<string | null>(null),
    fechaRecepcion: this.fb.control<string | null>(new Date().toISOString().slice(0, 10)),
    valorFactura: this.fb.control<number | null>(null),
    emailRemitente: this.fb.control<string | null>(null),
    pdfUrl: this.fb.control<string | null>(null),
  });

  openSelector(): void {
    this.showSelector.set(true);
  }
  onProveedorSelected(t: TerceroTableModel): void {
    this.frm.controls.proveedorId.setValue(t.id);
    this.proveedorNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }

  volver(): void {
    void this.router.navigate(['/facturas-proveedor']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Selecciona el proveedor');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      await lastValueFrom(this.service.create({ ...v, receptorId: null }));
      this.alert.success('Factura de proveedor registrada');
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
    return 'No se pudo guardar la factura';
  }
}
