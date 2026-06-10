import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { AlertService } from '../../../../shared/services/alert.service';
import { UsuarioService } from '../services/usuario.service';
import { RolService } from '../../rol/services/rol.service';
import { SedeService } from '../../sede/services/sede.service';
import { RolTableModel } from '../../rol/models/rol.model';
import { SedeTableModel } from '../../sede/models/sede.model';

@Component({
  selector: 'app-asignar-rol',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, SelectModule],
  templateUrl: './asignar-rol.component.html',
  styleUrl: './asignar-rol.component.css',
})
export class AsignarRolComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly sedeService = inject(SedeService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly usuarioId = input<number | null>(null);
  readonly usuarioNombre = input('');

  readonly loading = signal(false);
  readonly roles = signal<RolTableModel[]>([]);
  readonly sedes = signal<SedeTableModel[]>([]);

  readonly frm = this.fb.group({
    rolId: this.fb.control<number | null>(null, [Validators.required]),
    sedeId: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor() {
    void this.loadOptions();
  }

  private async loadOptions(): Promise<void> {
    try {
      const [roles, sedes] = await Promise.all([
        lastValueFrom(this.rolService.list({ page: 0, rows: 200 })),
        lastValueFrom(this.sedeService.list({ page: 0, rows: 200 })),
      ]);
      this.roles.set(roles.data.content);
      this.sedes.set(sedes.data.content);
    } catch {
      this.alert.error('No se pudieron cargar roles/sedes');
    }
  }

  close(): void {
    this.visible.set(false);
    this.frm.reset({ rolId: null, sedeId: null });
  }

  async asignar(): Promise<void> {
    await this.ejecutar('asignar');
  }
  async quitar(): Promise<void> {
    await this.ejecutar('quitar');
  }

  private async ejecutar(accion: 'asignar' | 'quitar'): Promise<void> {
    const id = this.usuarioId();
    if (this.frm.invalid || id == null) {
      this.frm.markAllAsTouched();
      return;
    }
    const dto = { rolId: this.frm.controls.rolId.value as number, sedeId: this.frm.controls.sedeId.value as number };
    this.loading.set(true);
    try {
      if (accion === 'asignar') {
        await lastValueFrom(this.service.asignarRol(id, dto));
        this.alert.success('Rol asignado');
      } else {
        await lastValueFrom(this.service.quitarRol(id, dto));
        this.alert.success('Rol quitado');
      }
    } catch (e: unknown) {
      this.alert.error(this.extractMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  private extractMessage(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo completar la operación';
  }
}
