/** Estados válidos del contrato (alineados con el CHECK del backend). */
export interface EstadoContratoOpcion {
  label: string;
  value: string;
}

export const ESTADOS_CONTRATO: EstadoContratoOpcion[] = [
  { label: 'Planeado', value: 'planeado' },
  { label: 'Adjudicado', value: 'adjudicado' },
  { label: 'Suscrito', value: 'suscrito' },
  { label: 'En ejecución', value: 'en_ejecucion' },
  { label: 'Liquidado', value: 'liquidado' },
  { label: 'Anulado', value: 'anulado' },
];

export const ESTADO_CONTRATO_SEVERITY: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
  planeado: 'secondary',
  adjudicado: 'info',
  suscrito: 'info',
  en_ejecucion: 'success',
  liquidado: 'warn',
  anulado: 'danger',
};

export function labelEstadoContrato(value: string): string {
  return ESTADOS_CONTRATO.find((e) => e.value === value)?.label ?? value;
}
