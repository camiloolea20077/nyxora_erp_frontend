import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

import { NAV_HOME, NAV_MENU, NavGroup, NavItem, findNavGroup } from './sidebar.menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly router = inject(Router);

  readonly home: NavItem = NAV_HOME;
  readonly menu: NavGroup[] = NAV_MENU;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Grupos abiertos manualmente (por click). */
  private readonly manual = signal<ReadonlySet<string>>(new Set());
  private readonly activeGroup = computed(() => findNavGroup(this.url()));

  /** Un grupo está abierto si lo abrió el usuario o contiene la ruta activa. */
  private readonly openGroups = computed<ReadonlySet<string>>(() => {
    const open = new Set(this.manual());
    const active = this.activeGroup();
    if (active) open.add(active);
    return open;
  });

  readonly dashboardActive = computed(() => this.url().startsWith('/dashboard'));

  toggle(label: string): void {
    this.manual.update((current) => {
      const next = new Set(current);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  isOpen(label: string): boolean {
    return this.openGroups().has(label);
  }

  isActive(route: string): boolean {
    const u = this.url();
    return u === route || u.startsWith(route + '/');
  }
}
