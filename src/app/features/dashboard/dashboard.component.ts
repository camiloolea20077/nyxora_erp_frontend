import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from './services/dashboard.service';

interface MetricCard {
  resource: string;
  label: string;
  icon: string;
  route: string;
  value: string;
  loading: boolean;
}

interface QuickLink {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly service = inject(DashboardService);
  readonly session = this.auth.session;

  readonly metrics = signal<MetricCard[]>([
    { resource: 'terceros', label: 'Terceros', icon: 'pi pi-users', route: '/terceros', value: '—', loading: true },
    { resource: 'productos', label: 'Productos', icon: 'pi pi-box', route: '/productos', value: '—', loading: true },
    { resource: 'facturas', label: 'Facturas', icon: 'pi pi-file', route: '/facturas', value: '—', loading: true },
    { resource: 'cuentas-cobrar', label: 'Cuentas por cobrar', icon: 'pi pi-money-bill', route: '/cuentas-cobrar', value: '—', loading: true },
    { resource: 'ordenes-compra', label: 'Órdenes de compra', icon: 'pi pi-shopping-cart', route: '/ordenes-compra', value: '—', loading: true },
    { resource: 'vinculaciones', label: 'Vinculaciones', icon: 'pi pi-id-card', route: '/vinculaciones', value: '—', loading: true },
    { resource: 'liquidaciones-nomina', label: 'Liquidaciones', icon: 'pi pi-dollar', route: '/liquidaciones', value: '—', loading: true },
    { resource: 'procesos-disciplinarios', label: 'Procesos disciplinarios', icon: 'pi pi-flag', route: '/procesos-disciplinarios', value: '—', loading: true },
  ]);

  readonly quickLinks: QuickLink[] = [
    { label: 'Nuevo tercero', icon: 'pi pi-user-plus', route: '/terceros' },
    { label: 'Facturar', icon: 'pi pi-file-edit', route: '/facturas' },
    { label: 'Orden de compra', icon: 'pi pi-shopping-cart', route: '/ordenes-compra' },
    { label: 'Comprobantes', icon: 'pi pi-book', route: '/comprobantes' },
    { label: 'Liquidar nómina', icon: 'pi pi-dollar', route: '/liquidaciones' },
    { label: 'Catálogos', icon: 'pi pi-th-large', route: '/catalogos' },
  ];

  ngOnInit(): void {
    void this.cargarMetricas();
  }

  private async cargarMetricas(): Promise<void> {
    const defs = this.metrics();
    await Promise.allSettled(
      defs.map(async (m) => {
        try {
          const res = await lastValueFrom(this.service.total(m.resource));
          this.setMetric(m.resource, this.formato(res.data.total), false);
        } catch {
          this.setMetric(m.resource, 's/d', false);
        }
      }),
    );
  }

  private setMetric(resource: string, value: string, loading: boolean): void {
    this.metrics.update((list) => list.map((m) => (m.resource === resource ? { ...m, value, loading } : m)));
  }

  private formato(n: number): string {
    return new Intl.NumberFormat('es-CO').format(n ?? 0);
  }
}
