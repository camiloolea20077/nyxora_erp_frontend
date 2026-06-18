import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { CatalogoItem } from '../../../../shared/models/catalogo.model';
import { VinculacionService } from '../../vinculacion/services/vinculacion.service';
import { VinculacionTableModel } from '../../vinculacion/models/vinculacion.model';
import { ConceptoNominaService } from '../../concepto-nomina/services/concepto-nomina.service';
import { ConceptoNominaTableModel } from '../../concepto-nomina/models/concepto-nomina.model';
import { NovedadNominaService } from '../services/novedad-nomina.service';
import { NovedadNominaModel } from '../models/novedad-nomina.model';

@Component({
  selector: 'app-form-novedad-nomina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './form-novedad-nomina.component.html',
  styleUrl: './form-novedad-nomina.component.css',
})
export class FormNovedadNominaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(NovedadNominaService);
  private readonly vinculacionService = inject(VinculacionService);
  private readonly conceptoService = inject(ConceptoNominaService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<NovedadNominaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly vinculaciones = signal<VinculacionTableModel[]>([]);
  readonly conceptos = signal<ConceptoNominaTableModel[]>([]);
  readonly bancos = signal<CatalogoItem[]>([]);

  readonly frm = this.fb.group({
    vinculacionId: this.fb.control<number | null>(null, [Validators.required]),
    conceptoNominaId: this.fb.control<number | null>(null, [Validators.required]),
    descripcion: this.fb.control<string | null>(null),
    cantidadValor: this.fb.control<number | null>(null),
    fechaInicial: this.fb.control<string | null>(null),
    fechaFinal: this.fb.control<string | null>(null),
    fechaAplicada: this.fb.control<string | null>(null),
    numeroCuota: this.fb.control<number | null>(null),
    dias: this.fb.control<number | null>(null),
    tipoAusentismo: this.fb.control<string | null>(null),
    tipoEmbargo: this.fb.control<string | null>(null),
    expediente: this.fb.control<string | null>(null),
    demandante: this.fb.control<string | null>(null),
    bancoId: this.fb.control<number | null>(null),
    numeroCuentaBancaria: this.fb.control<string | null>(null),
    estadoNovedad: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargarCatalogos();
  }

  /** Resetea el formulario al abrir el diálogo (no en un effect, para no resetear al interactuar con los selects). */
  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      vinculacionId: r?.vinculacionId ?? null,
      conceptoNominaId: r?.conceptoNominaId ?? null,
      descripcion: r?.descripcion ?? null,
      cantidadValor: r?.cantidadValor ?? null,
      fechaInicial: r?.fechaInicial ?? null,
      fechaFinal: r?.fechaFinal ?? null,
      fechaAplicada: r?.fechaAplicada ?? null,
      numeroCuota: r?.numeroCuota ?? null,
      dias: r?.dias ?? null,
      tipoAusentismo: r?.tipoAusentismo ?? null,
      tipoEmbargo: r?.tipoEmbargo ?? null,
      expediente: r?.expediente ?? null,
      demandante: r?.demandante ?? null,
      bancoId: r?.bancoId ?? null,
      numeroCuentaBancaria: r?.numeroCuentaBancaria ?? null,
      estadoNovedad: r?.estadoNovedad ?? null,
    });
  }

  isInvalid(field: 'vinculacionId' | 'conceptoNominaId'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }
  close(): void {
    this.visible.set(false);
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 1000 };
    try {
      const [vin, con, ban] = await Promise.all([
        lastValueFrom(this.vinculacionService.list(req)),
        lastValueFrom(this.conceptoService.list(req)),
        lastValueFrom(this.catalogoService.list('banco', { page: 0, rows: 500 })),
      ]);
      this.vinculaciones.set(vin.data.content);
      this.conceptos.set(con.data.content);
      this.bancos.set(ban.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('Vinculación y concepto son obligatorios');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      const payload = {
        ...v,
        vinculacionId: v.vinculacionId as number,
        conceptoNominaId: v.conceptoNominaId as number,
        terceroId: null,
      };
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...payload }));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.alert.success('Novedad guardada');
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
    return 'No se pudo guardar la novedad';
  }
}
