import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { ConceptoNominaService } from '../services/concepto-nomina.service';
import { ConceptoNominaModel, ConceptoNominaTableModel } from '../models/concepto-nomina.model';
import { FormConceptoNominaComponent } from '../form/form-concepto-nomina.component';

@Component({
  selector: 'app-index-concepto-nomina',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ConfirmDialogModule,
    FormConceptoNominaComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './index-concepto-nomina.component.html',
  styleUrl: './index-concepto-nomina.component.css',
})
export class IndexConceptoNominaComponent {
  private readonly service = inject(ConceptoNominaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly rows = signal<ConceptoNominaTableModel[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  search = '';
  filtroClase: string | null = null;

  readonly clases = [
    { label: 'Todas', value: null },
    { label: 'Devengado', value: 'devengado' },
    { label: 'Deducción', value: 'deduccion' },
    { label: 'Provisión', value: 'provision' },
    { label: 'Aporte', value: 'aporte' },
  ];

  readonly showForm = signal(false);
  readonly editing = signal<ConceptoNominaModel | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(
        this.service.list(
          { page: this.page(), rows: this.pageSize(), search: this.search || null },
          this.filtroClase,
        ),
      );
      this.rows.set(res.data.content);
      this.total.set(res.data.total);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudieron cargar los conceptos');
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
  onSearch(): void {
    this.page.set(0);
    this.load();
  }

  nuevo(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }
  async editar(row: ConceptoNominaTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(row.id));
      this.editing.set(res.data);
      this.showForm.set(true);
    } catch {
      this.alert.error('No se pudo abrir el concepto');
    }
  }
  eliminar(row: ConceptoNominaTableModel): void {
    this.confirm.confirm({
      message: `¿Eliminar el concepto "${row.nombre}"?`,
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
      this.alert.success('Concepto eliminado');
      this.load();
    } catch {
      this.alert.error('No se pudo eliminar el concepto');
    }
  }

  onSaved(): void {
    this.load();
  }
}
