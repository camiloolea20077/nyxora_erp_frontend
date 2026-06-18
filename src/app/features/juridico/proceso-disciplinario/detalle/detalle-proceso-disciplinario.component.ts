import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { FaltaService } from '../../falta/services/falta.service';
import { FaltaTableModel } from '../../falta/models/falta.model';
import { ProcesoDisciplinarioService } from '../services/proceso-disciplinario.service';
import {
  ProcesoDescargo,
  ProcesoDisciplinarioModel,
  ProcesoFalta,
  ProcesoNotificacion,
} from '../models/proceso-disciplinario.model';

@Component({
  selector: 'app-detalle-proceso-disciplinario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    InputTextModule,
    TabsModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalle-proceso-disciplinario.component.html',
  styleUrl: './detalle-proceso-disciplinario.component.css',
})
export class DetalleProcesoDisciplinarioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ProcesoDisciplinarioService);
  private readonly faltaService = inject(FaltaService);
  private readonly alert = inject(AlertService);
  private readonly confirm = inject(ConfirmationService);

  readonly id = signal<number>(0);
  readonly proceso = signal<ProcesoDisciplinarioModel | null>(null);
  readonly faltas = signal<ProcesoFalta[]>([]);
  readonly descargos = signal<ProcesoDescargo[]>([]);
  readonly notificaciones = signal<ProcesoNotificacion[]>([]);
  readonly loading = signal(false);
  readonly working = signal(false);

  readonly faltaOpciones = signal<FaltaTableModel[]>([]);
  readonly estados = [
    { label: 'Abierto', value: 'abierto' },
    { label: 'Descargos', value: 'descargos' },
    { label: 'Fallo', value: 'fallo' },
    { label: 'Archivado', value: 'archivado' },
    { label: 'Ejecutoriado', value: 'ejecutoriado' },
    { label: 'Anulado', value: 'anulado' },
  ];
  estadoSel: string | null = null;

  // add-row fields
  faltaId: number | null = null;
  descargoFecha: string | null = null;
  descargoTexto: string | null = null;
  notifFecha: string | null = null;
  notifTipo: string | null = null;
  notifTexto: string | null = null;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.id.set(id);
    void this.cargar();
    void this.cargarFaltas();
  }

  volver(): void {
    void this.router.navigate(['/procesos-disciplinarios']);
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    try {
      const [p, f, d, n] = await Promise.all([
        lastValueFrom(this.service.getById(this.id())),
        lastValueFrom(this.service.listFaltas(this.id())),
        lastValueFrom(this.service.listDescargos(this.id())),
        lastValueFrom(this.service.listNotificaciones(this.id())),
      ]);
      this.proceso.set(p.data);
      this.estadoSel = p.data.estado;
      this.faltas.set(f.data);
      this.descargos.set(d.data);
      this.notificaciones.set(n.data);
    } catch {
      this.alert.error('No se pudo cargar el proceso');
      this.volver();
    } finally {
      this.loading.set(false);
    }
  }

  private async cargarFaltas(): Promise<void> {
    try {
      const res = await lastValueFrom(this.faltaService.list({ page: 0, rows: 500 }));
      this.faltaOpciones.set(res.data.content);
    } catch {
      this.faltaOpciones.set([]);
    }
  }

  async cambiarEstado(): Promise<void> {
    if (!this.estadoSel) return;
    this.working.set(true);
    try {
      await lastValueFrom(this.service.cambiarEstado(this.id(), { estado: this.estadoSel }));
      this.alert.success('Estado actualizado');
      this.cargar();
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo cambiar el estado'));
    } finally {
      this.working.set(false);
    }
  }

  // ---------- Faltas ----------
  async agregarFalta(): Promise<void> {
    if (this.faltaId == null) {
      this.alert.error('Seleccione una falta');
      return;
    }
    try {
      await lastValueFrom(this.service.addFalta(this.id(), { faltaId: this.faltaId }));
      this.faltaId = null;
      const f = await lastValueFrom(this.service.listFaltas(this.id()));
      this.faltas.set(f.data);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo imputar la falta'));
    }
  }
  quitarFalta(row: ProcesoFalta): void {
    this.confirm.confirm({
      message: `¿Quitar la falta "${row.faltaNombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Quitar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await lastValueFrom(this.service.removeFalta(this.id(), row.id));
        const f = await lastValueFrom(this.service.listFaltas(this.id()));
        this.faltas.set(f.data);
      },
    });
  }

  // ---------- Descargos ----------
  async agregarDescargo(): Promise<void> {
    try {
      await lastValueFrom(this.service.addDescargo(this.id(), { fecha: this.descargoFecha, texto: this.descargoTexto }));
      this.descargoFecha = null;
      this.descargoTexto = null;
      const d = await lastValueFrom(this.service.listDescargos(this.id()));
      this.descargos.set(d.data);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo agregar el descargo'));
    }
  }
  async quitarDescargo(row: ProcesoDescargo): Promise<void> {
    await lastValueFrom(this.service.removeDescargo(this.id(), row.id));
    const d = await lastValueFrom(this.service.listDescargos(this.id()));
    this.descargos.set(d.data);
  }

  // ---------- Notificaciones ----------
  async agregarNotificacion(): Promise<void> {
    try {
      await lastValueFrom(
        this.service.addNotificacion(this.id(), { fecha: this.notifFecha, tipo: this.notifTipo, texto: this.notifTexto }),
      );
      this.notifFecha = null;
      this.notifTipo = null;
      this.notifTexto = null;
      const n = await lastValueFrom(this.service.listNotificaciones(this.id()));
      this.notificaciones.set(n.data);
    } catch (e: unknown) {
      this.alert.error(this.msg(e, 'No se pudo agregar la notificación'));
    }
  }
  async quitarNotificacion(row: ProcesoNotificacion): Promise<void> {
    await lastValueFrom(this.service.removeNotificacion(this.id(), row.id));
    const n = await lastValueFrom(this.service.listNotificaciones(this.id()));
    this.notificaciones.set(n.data);
  }

  private msg(e: unknown, fallback: string): string {
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message: unknown }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
    return fallback;
  }
}
