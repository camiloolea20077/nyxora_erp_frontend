# HU-FE-XXXX — <Título corto>

| Campo | Valor |
|---|---|
| **Código** | HU-FE-XXXX |
| **Módulo** | Auth / Dashboard / Catálogo / Inventario / Compras / Contabilidad / … |
| **Estado** | Propuesta / En análisis / Lista para desarrollo / En desarrollo / Hecha |
| **HU backend** | HU-XXXX (`../nyxora_erp/docs/hu/…`) |
| **Endpoints** | `POST /api/…`, `GET /api/…/{id}`, `POST /api/…/list` |

## Historia
> **Como** <rol>
> **quiero** <capacidad en la UI>
> **para** <beneficio>.

## Pantallas / componentes
- `index-<entidad>` (tabla lazy paginada) · `form-<entidad>` (dialog crear/editar) · `detalle-<entidad>` (dialog).
- Rutas: `/<modulo>` → index; sub-rutas si aplica. **Sin ruta `/nueva`** (los formularios son dialogs).

## Diseño (skill interface-design)
- Layout, jerarquía, estados (vacío/cargando/error), responsive. Enlazar el artefacto en `docs/ui/`.

## Contrato de datos (agente contrato-api)
- Modelos: `XxxModel`, `XxxTableModel`, `CreateXxxDto`, `UpdateXxxDto` (+ `XxxLineaUI` si hay líneas).
- Respuesta backend: `ApiResponse<T>` y `PageResponseDto<T>` (`{content,page,rows,total}`).

## Criterios de aceptación (Gherkin)
```gherkin
Escenario: Listar <entidad>
  Cuando abro /<modulo>
  Entonces veo la tabla paginada con búsqueda y el estado de carga/vacío

Escenario: Crear <entidad>
  Cuando abro el dialog y guardo un formulario válido
  Entonces se llama POST /api/<x>, se cierra el dialog y se recarga la tabla
```

## Reglas de negocio (UI)
- Validaciones de formulario, cálculos de líneas, permisos (`permisos` del token), estados deshabilitados.

## Preguntas abiertas
- …
