import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { AlertService } from '../../../../shared/services/alert.service';
import { VinculacionService } from '../../../nomina/vinculacion/services/vinculacion.service';
import { VinculacionTableModel } from '../../../nomina/vinculacion/models/vinculacion.model';
import { GrupoAcademicoService } from '../../grupo-academico/services/grupo-academico.service';
import { GrupoAcademicoTableModel } from '../../grupo-academico/models/grupo-academico.model';
import { CargaAcademicaService } from '../services/carga-academica.service';
import { CargaAcademicaModel } from '../models/carga-academica.model';

interface LineaUI {
  grupoAcademicoId: number | null;
  horas: number | null;
}

@Component({
  selector: 'app-form-carga-academica',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TableModule,
  ],
  templateUrl: './form-carga-academica.component.html',
  styleUrl: './form-carga-academica.component.css',
})
export class FormCargaAcademicaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CargaAcademicaService);
  private readonly vinculacionService = inject(VinculacionService);
  private readonly grupoService = inject(GrupoAcademicoService);
  private readonly alert = inject(AlertService);

  readonly visible = model(false);
  readonly registro = input<CargaAcademicaModel | null>(null);
  readonly saved = output<void>();

  readonly loading = signal(false);
  readonly isEdit = computed(() => !!this.registro());

  readonly vinculaciones = signal<VinculacionTableModel[]>([]);
  readonly grupos = signal<GrupoAcademicoTableModel[]>([]);
  readonly lineas = signal<LineaUI[]>([]);

  readonly frm = this.fb.group({
    vinculacionId: this.fb.control<number | null>(null, [Validators.required]),
    numeroActoAdministrativo: this.fb.control<string | null>(null),
    fechaActoAdministrativo: this.fb.control<string | null>(null),
  });

  constructor() {
    void this.cargarCatalogos();
  }

  private async cargarCatalogos(): Promise<void> {
    const req = { page: 0, rows: 1000 };
    try {
      const [vin, gru] = await Promise.all([
        lastValueFrom(this.vinculacionService.list(req)),
        lastValueFrom(this.grupoService.list(req)),
      ]);
      this.vinculaciones.set(vin.data.content);
      this.grupos.set(gru.data.content);
    } catch {
      this.alert.error('No se pudieron cargar los catálogos');
    }
  }

  onShow(): void {
    const r = this.registro();
    this.frm.reset({
      vinculacionId: r?.vinculacionId ?? null,
      numeroActoAdministrativo: r?.numeroActoAdministrativo ?? null,
      fechaActoAdministrativo: r?.fechaActoAdministrativo ?? null,
    });
    this.lineas.set(
      r ? r.detalle.map((d) => ({ grupoAcademicoId: d.grupoAcademicoId, horas: d.horas })) : [],
    );
  }

  agregarLinea(): void {
    this.lineas.update((l) => [...l, { grupoAcademicoId: null, horas: null }]);
  }
  quitarLinea(i: number): void {
    this.lineas.update((l) => l.filter((_, idx) => idx !== i));
  }
  setGrupo(i: number, value: number | null): void {
    this.lineas.update((l) => l.map((x, idx) => (idx === i ? { ...x, grupoAcademicoId: value } : x)));
  }
  setHoras(i: number, value: number | null): void {
    this.lineas.update((l) => l.map((x, idx) => (idx === i ? { ...x, horas: value } : x)));
  }

  isInvalid(field: 'vinculacionId'): boolean {
    const c = this.frm.controls[field];
    return c.invalid && c.touched;
  }
  close(): void {
    this.visible.set(false);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('El docente es obligatorio');
      return;
    }
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      const detalle = this.lineas().map((l) => ({
        asignaturaProgramaId: null,
        grupoAcademicoId: l.grupoAcademicoId,
        horas: l.horas,
      }));
      const payload = {
        vinculacionId: v.vinculacionId as number,
        nivelEstudioId: null,
        numeroActoAdministrativo: v.numeroActoAdministrativo,
        fechaActoAdministrativo: v.fechaActoAdministrativo,
        detalle,
      };
      const r = this.registro();
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, active: r.active, ...payload }));
      } else {
        await lastValueFrom(this.service.create(payload));
      }
      this.alert.success('Carga guardada');
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
    return 'No se pudo guardar la carga';
  }
}
