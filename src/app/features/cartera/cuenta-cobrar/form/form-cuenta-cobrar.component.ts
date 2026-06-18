import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  model,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { CuentaCobrarService } from '../services/cuenta-cobrar.service';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';

@Component({
  selector: 'app-form-cuenta-cobrar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './form-cuenta-cobrar.component.html',
  styleUrl: './form-cuenta-cobrar.component.css',
})
export class FormCuentaCobrarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CuentaCobrarService);
  private readonly terceroService = inject(TerceroService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly clientes = signal<TerceroTableModel[]>([]);

  readonly frm = this.fb.group({
    clienteId: this.fb.control<number | null>(null, [Validators.required]),
    fechaEmision: this.fb.control<string | null>(new Date().toISOString().slice(0, 10), [Validators.required]),
    fechaVencimiento: this.fb.control<string | null>(null),
    valorTotal: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  constructor() {
    void this.cargarClientes();
    effect(() => {
      // No lee clientes() para que la carga asíncrona no dispare un reset que borre la selección.
      if (this.visible()) {
        this.frm.reset({
          clienteId: null,
          fechaEmision: new Date().toISOString().slice(0, 10),
          fechaVencimiento: null,
          valorTotal: null,
        });
      }
    });
  }

  private async cargarClientes(): Promise<void> {
    try {
      const res = await lastValueFrom(this.terceroService.list({ page: 0, rows: 5000 }));
      this.clientes.set(res.data.content);
    } catch {
      /* ignore */
    }
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
      await lastValueFrom(this.service.create({ ...v, cuentaId: null, dias: null }));
      this.alert.success('Cuenta por cobrar creada');
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
    return 'No se pudo guardar la cuenta por cobrar';
  }
}
