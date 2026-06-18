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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { PolizaSeguroService } from '../../../activos-fijos/poliza-seguro/services/poliza-seguro.service';
import { PolizaSeguroTableModel } from '../../../activos-fijos/poliza-seguro/models/poliza-seguro.model';
import { ContratoService } from '../services/contrato.service';
import { ContratoModel } from '../models/contrato.model';
import { ESTADOS_CONTRATO, ESTADO_CONTRATO_SEVERITY } from '../estado-contrato';

@Component({
  selector: 'app-detalle-contrato',
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
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalle-contrato.component.html',
  styleUrl: './detalle-contrato.component.css',
})
export class DetalleContratoComponent {
  private readonly service = inject(ContratoService);
  private readonly polizaService = inject(PolizaSeguroService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly estados = ESTADOS_CONTRATO;

  readonly contrato = signal<ContratoModel | null>(null);
  readonly clausulas = computed(() => this.contrato()?.clausulas ?? []);
  readonly polizas = computed(() => this.contrato()?.polizas ?? []);

  readonly polizaOptions = signal<PolizaSeguroTableModel[]>([]);

  readonly showEstadoDialog = signal(false);
  readonly guardandoEstado = signal(false);
  estadoSeleccionado: string | null = null;

  readonly showPolizaDialog = signal(false);
  readonly guardandoPoliza = signal(false);
  polizaSeleccionada: number | null = null;

  private contratoId = 0;

  constructor() {
    this.contratoId = Number(this.route.snapshot.paramMap.get('id'));
    void this.cargar();
    void this.cargarPolizaOptions();
  }

  estadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return ESTADO_CONTRATO_SEVERITY[estado] ?? 'secondary';
  }

  private async cargar(): Promise<void> {
    try {
      const res = await lastValueFrom(this.service.getById(this.contratoId));
      this.contrato.set(res.data);
    } catch {
      this.alert.error('No se pudo cargar el contrato');
      this.volver();
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
    void this.router.navigate(['/contratos']);
  }
  editar(): void {
    void this.router.navigate(['/contratos', this.contratoId, 'editar']);
  }

  // ── estado ──
  abrirEstado(): void {
    this.estadoSeleccionado = this.contrato()?.estado ?? null;
    this.showEstadoDialog.set(true);
  }
  async cambiarEstado(): Promise<void> {
    if (this.estadoSeleccionado == null) {
      this.alert.error('Selecciona un estado');
      return;
    }
    this.guardandoEstado.set(true);
    try {
      const res = await lastValueFrom(this.service.cambiarEstado(this.contratoId, { estado: this.estadoSeleccionado }));
      this.contrato.set(res.data);
      this.alert.success('Estado actualizado');
      this.showEstadoDialog.set(false);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo cambiar el estado'));
    } finally {
      this.guardandoEstado.set(false);
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
      const res = await lastValueFrom(this.service.asignarPoliza(this.contratoId, { polizaSeguroId: this.polizaSeleccionada }));
      this.contrato.set(res.data);
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
      await lastValueFrom(this.service.removerPoliza(this.contratoId, polizaSeguroId));
      await this.cargar();
      this.alert.success('Póliza removida');
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo remover la póliza'));
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
