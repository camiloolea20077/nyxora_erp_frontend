import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { TerceroSelectorComponent } from '../../../../shared/components/tercero-selector/tercero-selector.component';
import { TerceroTableModel } from '../../../comun/tercero/models/tercero.model';
import { PolizaSeguroService } from '../../poliza-seguro/services/poliza-seguro.service';
import { PolizaSeguroTableModel } from '../../poliza-seguro/models/poliza-seguro.model';
import { ActivoFijoService } from '../services/activo-fijo.service';
import { ActivoFijoModel, DepreciacionTableModel } from '../models/activo-fijo.model';

@Component({
  selector: 'app-detalle-activo-fijo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    ConfirmDialogModule,
    TerceroSelectorComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalle-activo-fijo.component.html',
  styleUrl: './detalle-activo-fijo.component.css',
})
export class DetalleActivoFijoComponent {
  private readonly service = inject(ActivoFijoService);
  private readonly polizaService = inject(PolizaSeguroService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly activo = signal<ActivoFijoModel | null>(null);
  readonly responsables = computed(() => this.activo()?.responsables ?? []);
  readonly polizas = computed(() => this.activo()?.polizas ?? []);

  readonly depreciaciones = signal<DepreciacionTableModel[]>([]);

  // alta de responsable
  readonly showResponsableSelector = signal(false);

  // alta de póliza
  readonly polizaOptions = signal<PolizaSeguroTableModel[]>([]);
  readonly showPolizaDialog = signal(false);
  readonly guardandoPoliza = signal(false);
  polizaSeleccionada: number | null = null;

  // registro de depreciación
  readonly showDepDialog = signal(false);
  readonly guardandoDep = signal(false);
  depFecha: string | null = new Date().toISOString().slice(0, 10);
  depValor: number | null = null;
  depCuota: number | null = null;
  depPeriodo: number | null = null;

  private activoId = 0;

  constructor() {
    this.activoId = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar();
    void this.cargarDepreciaciones();
    void this.cargarPolizaOptions();
  }

  private async cargar(): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(this.activoId));
      this.activo.set(res.data);
    } catch {
      this.alert.error('No se pudo cargar el activo fijo');
      this.volver();
    }
  }

  private async cargarDepreciaciones(): Promise<void> {
    try {
      const res = await lastValueFrom(
        this.service.listDepreciaciones(this.activoId, { page: 0, rows: 200, order: 'DESC', order_by: 'fecha_aplicacion' }),
      );
      this.depreciaciones.set(res.data.content);
    } catch {
      this.depreciaciones.set([]);
    }
  }

  private async cargarPolizaOptions(): Promise<void> {
    try {
      const res = await lastValueFrom(this.polizaService.list({ page: 0, rows: 500 }));
      this.polizaOptions.set(res.data.content);
    } catch {
      this.polizaOptions.set([]);
    }
  }

  volver(): void {
    void this.router.navigate(['/activos-fijos']);
  }

  // ── responsables ──
  abrirResponsable(): void {
    this.showResponsableSelector.set(true);
  }
  async onResponsableSelected(t: TerceroTableModel): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.asignarResponsable(this.activoId, { terceroId: t.id }));
      this.activo.set(res.data);
      this.alert.success('Responsable asignado');
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo asignar el responsable'));
    }
  }
  removerResponsable(terceroId: number, nombre: string | null): void {
    this.confirm.confirm({
      message: `¿Quitar a "${nombre ?? '#' + terceroId}" como responsable?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Quitar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doRemoverResponsable(terceroId),
    });
  }
  private async doRemoverResponsable(terceroId: number): Promise<void> {
    try {
      await lastValueFrom(this.service.removerResponsable(this.activoId, terceroId));
      await this.cargar();
      this.alert.success('Responsable removido');
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo remover el responsable'));
    }
  }

  // ── pólizas ──
  abrirPoliza(): void {
    this.polizaSeleccionada = null;
    this.showPolizaDialog.set(true);
  }
  async asignarPoliza(): Promise<void> {
    if (this.polizaSeleccionada == null) {
      this.alert.error('Selecciona una póliza');
      return;
    }
    this.guardandoPoliza.set(true);
    try {
      const res = await lastValueFrom(this.service.asignarPoliza(this.activoId, { polizaSeguroId: this.polizaSeleccionada }));
      this.activo.set(res.data);
      this.alert.success('Póliza asignada');
      this.showPolizaDialog.set(false);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo asignar la póliza'));
    } finally {
      this.guardandoPoliza.set(false);
    }
  }
  removerPoliza(polizaSeguroId: number, numero: string | null): void {
    this.confirm.confirm({
      message: `¿Quitar la póliza "${numero ?? '#' + polizaSeguroId}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Quitar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.doRemoverPoliza(polizaSeguroId),
    });
  }
  private async doRemoverPoliza(polizaSeguroId: number): Promise<void> {
    try {
      await lastValueFrom(this.service.removerPoliza(this.activoId, polizaSeguroId));
      await this.cargar();
      this.alert.success('Póliza removida');
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo remover la póliza'));
    }
  }

  // ── depreciación ──
  abrirDepreciacion(): void {
    this.depFecha = new Date().toISOString().slice(0, 10);
    this.depValor = null;
    this.depCuota = null;
    this.depPeriodo = null;
    this.showDepDialog.set(true);
  }
  async registrarDepreciacion(): Promise<void> {
    if (this.depValor == null) {
      this.alert.error('Ingresa el valor de depreciación');
      return;
    }
    this.guardandoDep.set(true);
    try {
      await lastValueFrom(
        this.service.registrarDepreciacion({
          activoFijoId: this.activoId,
          fechaAplicacion: this.depFecha,
          valorDepreciacion: this.depValor,
          cuotaDepreciacion: this.depCuota,
          periodoAmortizacion: this.depPeriodo,
          unidadesProducidas: null,
        }),
      );
      this.alert.success('Depreciación registrada');
      this.showDepDialog.set(false);
      await Promise.all([this.cargar(), this.cargarDepreciaciones()]);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo registrar la depreciación'));
    } finally {
      this.guardandoDep.set(false);
    }
  }

  private msg(e: unknown, fallback: string): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return fallback;
  }
}
