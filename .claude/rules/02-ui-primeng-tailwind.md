# Regla 02 — UI: PrimeNG 20 + Aura + Tailwind 4

## Diseño primero (skill interface-design)
- **Antes de escribir HTML/estilos, usar la skill `interface-design`** para definir layout, jerarquía
  visual, densidad, estados (cargando / vacío / error) y responsive. El ERP debe verse **profesional**.
- Guardar decisiones/artefactos en `docs/ui/`. Reusar patrones entre módulos (consistencia > creatividad).

## Theming (ya configurado)
- `app.config.ts` usa `providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.dark' } } })`.
- Modo oscuro: alternar la clase `.dark` en `<html>`. No hardcodear colores que el preset ya da.
- Componentes PrimeNG se importan **standalone** en cada componente:
  ```ts
  imports: [TableModule, ButtonModule, DialogModule, InputTextModule, InputNumberModule,
            SelectModule, ToastModule, ConfirmDialogModule, ReactiveFormsModule]
  ```
- `MessageService` / `ConfirmationService` desde `primeng/api`, provistos **solo en el index** (no en dialogs).

## Tailwind 4
- Utilidades de layout/espaciado con Tailwind (`flex`, `grid`, `gap-*`, `p-*`, `rounded-2xl`, `text-*`).
- Tailwind 4 se configura vía `@tailwindcss/vite` + `@import "tailwindcss"` en `styles.css` (sin `tailwind.config` JS salvo necesidad).
- **No usar PrimeFlex** (reemplazado por Tailwind). Para integrar tokens PrimeNG↔Tailwind, opcional `tailwindcss-primeui`.

## Design tokens Nyxora (CSS variables en `styles.css`) — paleta azul/navy, SIN morados
```css
:root {
  --nx-primary: #2563eb;        /* blue-600 (botón/acciones) */
  --nx-primary-hover: #1d4ed8;  /* blue-700 */
  --nx-primary-soft: rgba(37, 99, 235, 0.1);
  --nx-ink: #0f172a; --nx-ink-2: #1e293b;                       /* paneles oscuros */
  --nx-brand-panel: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
  --nx-bg: #f1f5f9; --nx-surface: #ffffff; --nx-border: #e2e8f0;
  --nx-text: #0f172a; --nx-muted: #64748b;
  --nx-success: #10b981; --nx-warning: #f59e0b; --nx-danger: #ef4444;
  --sidebar-w: 260px; --sidebar-collapsed: 72px;
}
```
> **Prohibido el morado/violeta.** La marca es azul profesional sobre navy; nada de degradados a `#7b4dff`.
- Tipografía: **Outfit** (UI) y **JetBrains Mono** (números: precios, cantidades, códigos, IDs).
- Cards: `rounded-2xl border` con `--nx-border` (radio ~16px). Encabezado de módulo con icono en chip.

## Patrón de tabla (index) — server-side
```html
<p-table [value]="rows()" [lazy]="true" [loading]="loading()" [paginator]="true"
         [rows]="pageSize()" [totalRecords]="total()" (onLazyLoad)="onLazy($event)" dataKey="id">
  <ng-template pTemplate="header"> … </ng-template>
  <ng-template pTemplate="body" let-row>
    <tr class="clickable-row" (click)="verDetalle(row)"> …
      <td (click)="$event.stopPropagation()"> <!-- acciones --> </td>
    </tr>
  </ng-template>
  <ng-template pTemplate="emptymessage"> <tr><td class="empty-row">Sin registros</td></tr> </ng-template>
</p-table>
```
- `totalRecords` ← `res.data.total`; filas ← `res.data.content` (ver regla 03).
- Búsqueda/filtros con `ngModel` (FormsModule) enlazados a un `signal`; al cambiar → `page=0` y recargar.
- Eliminar/anular con `ConfirmationService`.

## Patrón de dialog (form/detalle)
```html
<p-dialog [header]="isEdit() ? 'Editar' : 'Nuevo'" [(visible)]="visible" [modal]="true"
          [style]="{ width: '560px' }" [draggable]="false" [resizable]="false" (onHide)="close()">
  <form [formGroup]="frm" class="grid gap-3"> … </form>
  <ng-template pTemplate="footer">
    <p-button label="Cancelar" severity="secondary" text (onClick)="close()" />
    <p-button [label]="isEdit() ? 'Actualizar' : 'Guardar'" [loading]="loading()" (onClick)="save()" />
  </ng-template>
</p-dialog>
```
**Anchos:** simple `420px` · estándar `560px` · con líneas dinámicas `860px` · detalle `780px`.

## Formularios
- DTO principal: **Reactive Forms** (`formControlName`). `ngModel` solo en filtros y líneas dinámicas.
- `ngOnChanges`/`effect` para resetear y precargar al abrir el dialog. `frm.markAllAsTouched()` antes de validar.
- Helper `isInvalid(field)` para mostrar errores. Mensajes en español.

## Líneas dinámicas (compras/mermas/POS)
- Cada línea con `_id: string` (uuid) y `track` por `_id` en `@for`.
- `calcLinea()` al insertar Y al modificar cantidad/valor. Totales con `computed()` sobre el array de líneas.
- Impuestos: acumular en **$** (valor calculado), no en %.

## Accesibilidad / pro
- Estados de carga con skeleton/spinner; vacío con mensaje + acción; error con alerta.
- Botones con icono + label; acciones destructivas con confirmación. Foco al abrir dialog.
