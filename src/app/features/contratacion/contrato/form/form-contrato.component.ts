import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { AlertService } from '../../../../shared/services/alert.service';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { ModalidadContratoService } from '../../modalidad-contrato/services/modalidad-contrato.service';
import { ModalidadContratoTableModel } from '../../modalidad-contrato/models/modalidad-contrato.model';
import { ContratoService } from '../services/contrato.service';
import { ClausulaLineaUI, ContratoClausulaDto, ContratoModel } from '../models/contrato.model';

@Component({
  selector: 'app-form-contrato',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    TerceroSelectorComponent,
  ],
  templateUrl: './form-contrato.component.html',
  styleUrl: './form-contrato.component.css',
})
export class FormContratoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ContratoService);
  private readonly modalidadService = inject(ModalidadContratoService);
  private readonly terceroService = inject(TerceroService);
  private readonly alert = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly contratoId = signal<number | null>(null);
  readonly isEdit = computed(() => this.contratoId() != null);
  private registro: ContratoModel | null = null;

  readonly modalidades = signal<ModalidadContratoTableModel[]>([]);
  readonly showSelector = signal(false);
  readonly contratistaNombre = signal<string | null>(null);

  private seq = 0;
  readonly clausulas = signal<ClausulaLineaUI[]>([]);

  readonly frm = this.fb.group({
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(191)]),
    numero: this.fb.control<string | null>(null),
    tipoContrato: this.fb.control<string | null>(null),
    contratistaId: this.fb.control<number | null>(null),
    modalidadId: this.fb.control<number | null>(null),
    objeto: this.fb.control<string | null>(null),
    fechaInicio: this.fb.control<string | null>(null),
    fechaFin: this.fb.control<string | null>(null),
    valor: this.fb.control<number | null>(null),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.contratoId.set(idParam ? Number(idParam) : null);
    void this.init();
  }

  private async init(): Promise<void> {
    await this.cargarModalidades();
    const id = this.contratoId();
    if (id != null) {
      try {
        const res = await lastValueFrom(this.service.getById(id));
        this.registro = res.data;
        this.aplicar(res.data);
      } catch {
        this.alert.error('No se pudo cargar el contrato');
        this.volver();
      }
    }
  }

  private async cargarModalidades(): Promise<void> {
    try {
      const res = await lastValueFrom(this.modalidadService.list({ page: 0, rows: 500 }));
      this.modalidades.set(res.data.content);
    } catch {
      this.modalidades.set([]);
    }
  }

  private aplicar(c: ContratoModel): void {
    this.frm.reset({
      nombre: c.nombre,
      numero: c.numero,
      tipoContrato: c.tipoContrato,
      contratistaId: c.contratistaId,
      modalidadId: c.modalidadId,
      objeto: c.objeto,
      fechaInicio: c.fechaInicio,
      fechaFin: c.fechaFin,
      valor: c.valor,
    });
    this.contratistaNombre.set(c.contratistaNombre);
    this.clausulas.set(
      c.clausulas.map((cl) => ({
        _id: ++this.seq,
        numero: cl.numero,
        orden: cl.orden,
        nombre: cl.nombre,
        texto: cl.texto,
      })),
    );
  }

  openSelector(): void {
    this.showSelector.set(true);
  }
  onContratistaSelected(t: TerceroTableModel): void {
    this.frm.controls.contratistaId.setValue(t.id);
    this.contratistaNombre.set(`${t.nombre} · ${t.numeroDocumento}`);
  }
  limpiarContratista(): void {
    this.frm.controls.contratistaId.setValue(null);
    this.contratistaNombre.set(null);
  }

  agregarClausula(): void {
    this.clausulas.update((arr) => [
      ...arr,
      { _id: ++this.seq, numero: String(arr.length + 1), orden: String(arr.length + 1), nombre: null, texto: null },
    ]);
  }
  quitarClausula(id: number): void {
    this.clausulas.update((arr) => arr.filter((l) => l._id !== id));
  }

  volver(): void {
    void this.router.navigate(['/contratos']);
  }

  async save(): Promise<void> {
    if (this.frm.invalid) {
      this.frm.markAllAsTouched();
      this.alert.error('El nombre del contrato es obligatorio');
      return;
    }
    const clausulas: ContratoClausulaDto[] = this.clausulas()
      .filter((l) => (l.nombre && l.nombre.trim()) || (l.texto && l.texto.trim()))
      .map((l) => ({ numero: l.numero, orden: l.orden, nombre: l.nombre, texto: l.texto }));
    this.loading.set(true);
    try {
      const v = this.frm.getRawValue();
      const r = this.registro;
      if (r) {
        await lastValueFrom(this.service.update({ id: r.id, ...v, clausulas }));
      } else {
        await lastValueFrom(this.service.create({ ...v, clausulas }));
      }
      this.alert.success('Contrato guardado');
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
    return 'No se pudo guardar el contrato';
  }
}
