import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/** Notificaciones al usuario (wrapper de PrimeNG MessageService). Requiere <p-toast/> montado. */
@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly msg = inject(MessageService);

  success(detail: string, summary = 'Éxito'): void {
    this.msg.add({ severity: 'success', summary, detail, life: 3000 });
  }

  error(detail: string, summary = 'Error'): void {
    this.msg.add({ severity: 'error', summary, detail, life: 5000 });
  }

  info(detail: string, summary = 'Información'): void {
    this.msg.add({ severity: 'info', summary, detail, life: 3000 });
  }

  warn(detail: string, summary = 'Atención'): void {
    this.msg.add({ severity: 'warn', summary, detail, life: 4000 });
  }
}
