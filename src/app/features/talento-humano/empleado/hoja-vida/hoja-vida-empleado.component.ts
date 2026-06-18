import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AlertService } from '../../../../shared/services/alert.service';
import { TerceroService } from '../../../comun/tercero/services/tercero.service';
import { EstudiosEmpleadoComponent } from '../satelites/estudios/estudios-empleado.component';
import { FamiliaresEmpleadoComponent } from '../satelites/familiares/familiares-empleado.component';
import { HistoriaEmpleadoComponent } from '../satelites/historia/historia-empleado.component';
import { EvaluacionesEmpleadoComponent } from '../satelites/evaluaciones/evaluaciones-empleado.component';

@Component({
  selector: 'app-hoja-vida-empleado',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    TabsModule,
    ConfirmDialogModule,
    EstudiosEmpleadoComponent,
    FamiliaresEmpleadoComponent,
    HistoriaEmpleadoComponent,
    EvaluacionesEmpleadoComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './hoja-vida-empleado.component.html',
  styleUrl: './hoja-vida-empleado.component.css',
})
export class HojaVidaEmpleadoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly terceroService = inject(TerceroService);
  private readonly alert = inject(AlertService);

  readonly empleadoId = signal<number>(0);
  readonly nombre = signal<string>('');
  readonly documento = signal<string>('');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.empleadoId.set(id);
    void this.cargarEmpleado(id);
  }

  private async cargarEmpleado(id: number): Promise<void> {
    try {
      const res = await lastValueFrom(this.terceroService.getById(id));
      this.nombre.set(res.data.nombre ?? res.data.razonSocial ?? 'Empleado');
      this.documento.set(res.data.numeroDocumento);
    } catch {
      this.alert.error('No se pudo cargar el empleado');
      this.volver();
    }
  }

  volver(): void {
    void this.router.navigate(['/empleados']);
  }
}
