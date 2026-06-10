import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

interface StatCard {
  label: string;
  icon: string;
  value: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  readonly session = this.auth.session;

  readonly stats: StatCard[] = [
    { label: 'Terceros', icon: 'pi pi-users', value: '—' },
    { label: 'Productos', icon: 'pi pi-box', value: '—' },
    { label: 'Órdenes de compra', icon: 'pi pi-shopping-cart', value: '—' },
    { label: 'Comprobantes', icon: 'pi pi-file-edit', value: '—' },
  ];
}
