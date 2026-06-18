import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { ProgramaService } from '../../programa/services/programa.service';
import { ProgramaTableModel } from '../../programa/models/programa.model';
import { AsignaturaService } from '../services/asignatura.service';
import { ProgramaAsignaturaModel } from '../models/asignatura.model';

@Component({
  selector: 'app-programas-asignatura',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TableModule, ButtonModule, InputNumberModule, SelectModule],
  templateUrl: './programas-asignatura.component.html',
  styleUrl: './programas-asignatura.component.css',
})
export class ProgramasAsignaturaComponent {
  private readonly service = inject(AsignaturaService);
  private readonly programaService = inject(ProgramaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly asignaturaId = input.required<number>();

  readonly items = signal<ProgramaAsignaturaModel[]>([]);
  readonly programas = signal<ProgramaTableModel[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  programaAcademicoId: number | null = null;
  semestre: number | null = null;
  creditos: number | null = null;

  constructor() {
    void this.cargarProgramas();
    effect(() => {
      if (this.asignaturaId()) void this.load();
    });
  }

  private async cargarProgramas(): Promise<void> {
    try {
      const res = await lastValueFrom(this.programaService.list({ page: 0, rows: 500 }));
      this.programas.set(res.data.content);
    } catch {
      this.programas.set([]);
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.listProgramas(this.asignaturaId()));
      this.items.set(res.data);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async agregar(): Promise<void> {
    if (this.programaAcademicoId == null) {
      this.alert.error('Seleccione un programa');
      return;
    }
    this.saving.set(true);
    try {
      await lastValueFrom(
        this.service.addPrograma(this.asignaturaId(), {
          programaAcademicoId: this.programaAcademicoId,
          semestre: this.semestre,
          creditos: this.creditos,
        }),
      );
      this.alert.success('Programa asociado');
      this.programaAcademicoId = null;
      this.semestre = null;
      this.creditos = null;
      this.load();
    } catch (e: unknown) {
      this.alert.error(this.msg(e));
    } finally {
      this.saving.set(false);
    }
  }

  eliminar(row: ProgramaAsignaturaModel): void {
    this.confirm.confirm({
      message: `¿Quitar la asignatura del programa "${row.programaNombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Quitar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doDelete(row.id),
    });
  }
  private async doDelete(enlaceId: number): Promise<void> {
    try {
      await lastValueFrom(this.service.removePrograma(this.asignaturaId(), enlaceId));
      this.alert.success('Programa desasociado');
      this.load();
    } catch {
      this.alert.error('No se pudo desasociar');
    }
  }

  private msg(e: unknown): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return 'No se pudo asociar el programa';
  }
}
