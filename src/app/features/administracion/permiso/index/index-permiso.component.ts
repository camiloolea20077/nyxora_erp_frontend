import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';

import { AlertService } from '../../../../shared/services/alert.service';
import { PermisoService } from '../services/permiso.service';
import { PermisoModel } from '../models/permiso.model';

@Component({
  selector: 'app-index-permiso',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule],
  templateUrl: './index-permiso.component.html',
  styleUrl: './index-permiso.component.css',
})
export class IndexPermisoComponent {
  private readonly service = inject(PermisoService);
  private readonly alert = inject(AlertService);

  readonly rows = signal<PermisoModel[]>([]);
  readonly loading = signal(false);

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await lastValueFrom(this.service.getAll());
      this.rows.set(res.data);
    } catch {
      this.rows.set([]);
      this.alert.error('No se pudo cargar el catálogo de permisos');
    } finally {
      this.loading.set(false);
    }
  }
}
