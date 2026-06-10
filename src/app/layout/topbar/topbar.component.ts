import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenuModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly title = input('');
  readonly toggle = output<void>();

  readonly session = this.auth.session;
  readonly initial = computed(() => (this.session()?.username?.charAt(0) ?? '?').toUpperCase());

  readonly userMenu: MenuItem[] = [
    { label: 'Mi cuenta', icon: 'pi pi-user', disabled: true },
    { separator: true },
    { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => void this.logout() },
  ];

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
