import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { ConceptoNominaService } from '../../../nomina/concepto-nomina/services/concepto-nomina.service';
import { ConceptoNominaTableModel } from '../../../nomina/concepto-nomina/models/concepto-nomina.model';
import { CargaAcademicaService } from '../services/carga-academica.service';
import { CargaAcademicaModel, CargaAcademicaTableModel } from '../models/carga-academica.model';
import { FormCargaAcademicaComponent } from '../form/form-carga-academica.component';

@Component({
  selector: 'app-index-carga-academica',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    SelectModule,
    InputNumberModule,
    ConfirmDialogModule,
    FormCargaAcademicaComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-carga-academica.component.html',
  styleUrl: './index-carga-academica.component.css',
})
export class IndexCargaAcademicaComponent {
  private readonly service = inject(CargaAcademicaService);
  private readonly conceptoService = inject(ConceptoNominaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<CargaAcademicaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  readonly showForm = signal(false);
  readonly editing = signal<CargaAcademicaModel | null>(null);

  // Generar novedad
  readonly conceptos = signal<ConceptoNominaTableModel[]>([]);
  readonly showNovedad = signal(false);
  readonly working = signal(false);
  novedadCargaId: number | null = null;
  conceptoNominaId: number | null = null;
  valorHora: number | null = null;

  constructor() {
    void this.cargarConceptos();
  }

  private async cargarConceptos(): Promise<void> {
    try {
      const res = await lastValueFrom(this.conceptoService.list({ page: 0, rows: 500 }, 'devengado'));
      this.conceptos.set(res.data.content);
    } catch {
      this.conceptos.set([]);
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.list({ page: this.page(), rows: this.pageSize() }));
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudieron cargar las cargas');
    } finally {
      this.loading.set(false);
    }
  }

  onLazy(e: TableLazyLoadEvent): void {
    const rows = e.rows ?? 10;
    this.pageSize.set(rows);
    this.page.set(Math.floor((e.first ?? 0) / rows));
    this.load();
  }

  nuevo(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }
  async editar(row: CargaAcademicaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir la carga');
    }
  }
  eliminar(row: CargaAcademicaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar la carga de "${row.docenteNombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doDelete(row.id),
    });
  }
  private async doDelete(id: number): Promise<void> {
    try {
      await lastValueFrom(this.service.delete(id));
      this.alert.success('Carga eliminada');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar la carga');
    }
  }

  abrirNovedad(row: CargaAcademicaTableModel): void {
    this.novedadCargaId = row.id;
    this.conceptoNominaId = null;
    this.valorHora = null;
    this.showNovedad.set(true);
  }
  async confirmarNovedad(): Promise<void> {
    if (this.novedadCargaId == null || this.conceptoNominaId == null || this.valorHora == null) {
      this.alert.error('Concepto y valor por hora son obligatorios');
      return;
    }
    this.working.set(true);
    try {
      await lastValueFrom(
        this.service.generarNovedad(this.novedadCargaId, {
          conceptoNominaId: this.conceptoNominaId,
          valorHora: this.valorHora,
        }),
      );
      this.alert.success('Novedad de nómina solicitada');
      this.showNovedad.set(false);
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.working.set(false);
    }
  }

  onSaved(): void {
    this.load();
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo generar la novedad';
  }
}
