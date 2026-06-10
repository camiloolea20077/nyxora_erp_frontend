import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';

import { AlertService } from '../../../../shared/services/alert.service';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioModel } from '../models/usuario.model';

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    TerceroSelectorComponent,
  ],
  templateUrl: './form-usuario.component.html',
  styleUrl: './form-usuario.component.css',
})
export class FormUsuarioComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<UsuarioModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly showSelector = signal(false);
  readonly selectedTercero = signal<TerceroTableModel | null>(null);

  readonly frm = this.fb.group({
    terceroId: this.fb.control<number | null>(null, [Validators.required]),
    username: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(60)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control(''),
    active: this.fb.nonNullable.control(true),
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const r = this.registro();
        if (r) {
          this.frm.reset({
            terceroId: r.terceroId,
            username: r.username,
            email: r.email,
            password: '',
            active: r.active,
          });
          this.frm.controls.terceroId.disable();
          this.frm.controls.username.disable();
          this.frm.controls.password.clearValidators();
        } else {
          this.frm.reset({ terceroId: null, username: '', email: '', password: '', active: true });
          this.selectedTercero.set(null);
          this.frm.controls.terceroId.enable();
          this.frm.controls.username.enable();
          this.frm.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
        }
        this.frm.controls.password.updateValueAndValidity();
      }
    });
  }

  isInvalid(field: 'terceroId' | 'username' | 'email' | 'password'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }

  openSelector(): void {
    this.showSelector.set(true);
  }

  onTerceroSelected(t: TerceroTableModel): void {
    this.selectedTercero.set(t);
    this.frm.controls.terceroId.setValue(t.id);
    this.frm.controls.terceroId.markAsTouched();
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
        await lastValueFrom(
          this.service.update({
            id: r.id,
            email: v.email,
            active: v.active,
            ...(v.password ? { password: v.password } : {}),
          }),
        );
      } else {
        if (v.terceroId == null) return;
        await lastValueFrom(
          this.service.create({
            terceroId: v.terceroId,
            username: v.username,
            email: v.email,
            password: v.password,
          }),
        );
      }
      this.alert.success('Usuario guardado');
      this.saved.emit();
      this.close();
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
    return 'No se pudo guardar el usuario';
  }
}
