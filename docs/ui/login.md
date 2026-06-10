# Diseño UI — Login (HU-FE-0001)

## 1. Propósito y usuario
Punto de entrada del ERP. El usuario (operativo/administrativo) se autentica con `username` + `password`.
Frecuencia: 1 vez por jornada. Prioridad: claridad, foco en el formulario, marca presente.

## 2. Arquetipo de layout
**Split full-screen**: panel de marca (izquierda, gradiente Aura) + panel de formulario (derecha, card).
En móvil (<768) se apila: marca arriba compacta, formulario debajo (card a ancho completo).

## 3. Wireframe (escritorio ≥768)
```
┌───────────────────────────────┬───────────────────────────────┐
│   (panel navy #1e293b→#0f172a) │            (superficie)        │
│                               │                                │
│     ◆ Nyxora ERP              │     Iniciar sesión             │
│     Gestión empresarial        │     Accede a tu cuenta         │
│     reactiva                   │                                │
│                               │     Usuario                    │
│     “Todo tu negocio          │     [ 👤  ____________ ]        │
│      en un solo lugar.”        │                                │
│                               │     Contraseña                 │
│                               │     [ 🔒  ________  👁 ]        │
│                               │                                │
│                               │     [   Ingresar  (loading) ]  │
│                               │                                │
│                               │     v0.1 · © Nyxora            │
└───────────────────────────────┴───────────────────────────────┘
```

## 4. Jerarquía y acciones
- **Primaria:** botón "Ingresar" (gradiente, full width, `loading`).
- Título "Iniciar sesión" (Outfit 700) + subtítulo muted.
- Marca a la izquierda (logo + tagline). Sin links secundarios en v1 (sin registro público).

## 5. Campos del formulario (Reactive Forms)
| Campo | Control | Validación | Obligatorio |
|---|---|---|---|
| Usuario | `p-inputtext` (icono usuario) | `required` | sí |
| Contraseña | `p-password` (toggleMask, sin feedback) | `required` | sí |

Errores inline bajo el campo si `touched && invalid` ("El usuario es obligatorio", etc.).

## 6. Estados
- **Cargando/enviando:** botón con `[loading]="loading()"`, form deshabilitado.
- **Error de credenciales/servidor:** `p-toast` (AlertService.error) con el `message` del backend; no romper layout.
- **Éxito:** persistir sesión → navegar a `/dashboard`.
- **Sin conexión backend:** toast "No se pudo conectar".

## 7. Responsive
- ≥768: split 2 columnas (marca 45% / formulario 55%), card centrado vertical.
- <768: una columna; banda de marca compacta arriba (logo + nombre), card debajo con padding cómodo.

## 8. Mapeo a componentes PrimeNG 20
- `InputTextModule` (usuario, con `<p-iconfield>`/`<p-inputicon>` opcional), `PasswordModule` (`toggleMask`, `[feedback]="false"`),
  `ButtonModule` (`pButton`, gradiente vía clase), `ToastModule` (global en App). Layout con Tailwind.

## 9. Notas de consistencia
- Tokens Aura/Nyxora (regla 02): gradiente primario para el CTA y el panel de marca; tipografía Outfit;
  card `rounded-2xl border`. Este patrón de "auth split" se reutiliza para recuperar contraseña a futuro.
