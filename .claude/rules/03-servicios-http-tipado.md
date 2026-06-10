# Regla 03 — Servicios HTTP, contrato del backend y sesión

> El backend Nyxora (`../nyxora_erp`) define el contrato. **Respetar estas formas exactas** —
> NO son las de Spring `Page` (no hay `totalElements`/`totalPages`); el backend devuelve un DTO propio.

## Contrato de respuesta (igual para todos los endpoints)
```ts
// shared/models/response.model.ts
export interface ApiResponse<T> {
  status: number;
  message: string;
  error: boolean;
  data: T;
}

// Paginado del backend (PageResponseDto): content + page + rows + total
export interface PageResponse<T> {
  content: T[];
  page: number;
  rows: number;
  total: number;
}
```

## Contrato de request paginado (PageableDto)
```ts
// shared/models/pageable.model.ts
export interface Pageable<T = unknown> {
  page: number;            // base 0
  rows: number;            // tamaño de página
  search?: string | null;
  order_by?: string | null;
  order?: 'ASC' | 'DESC' | null;
  params?: T | null;       // filtros específicos del módulo (tipados, nunca any)
}
```

## Endpoints estándar (CRUD del backend)
| Acción | Método + ruta | Body | `data` de la respuesta |
|---|---|---|---|
| Crear | `POST /api/{x}` | `CreateXxxDto` | `XxxModel` (HTTP 201) |
| Actualizar | `PUT /api/{x}` | `UpdateXxxDto` (incluye `id`) | `boolean` |
| Eliminar | `DELETE /api/{x}/{id}` | — | `boolean` |
| Detalle | `GET /api/{x}/{id}` | — | `XxxModel` |
| Listar | `POST /api/{x}/list` | `Pageable` | `PageResponse<XxxTableModel>` |
| Acción estado | `POST /api/{x}/{id}/{accion}` | a veces body | varía (`boolean` / `XxxModel`) |

> Confirma rutas y campos reales con el agente **contrato-api** (lee `../nyxora_erp/docs/api/*.http`,
> las HUs y Swagger `/v3/api-docs`). No inventes nombres de campo.

## Patrón de servicio (tipado, sin `any`)
```ts
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}productos`; // → http://localhost:8081/api/productos

  list(req: Pageable): Observable<ApiResponse<PageResponse<ProductoTableModel>>> {
    return this.http.post<ApiResponse<PageResponse<ProductoTableModel>>>(`${this.base}/list`, req);
  }
  getById(id: number): Observable<ApiResponse<ProductoModel>> {
    return this.http.get<ApiResponse<ProductoModel>>(`${this.base}/${id}`);
  }
  create(dto: CreateProductoDto): Observable<ApiResponse<ProductoModel>> {
    return this.http.post<ApiResponse<ProductoModel>>(this.base, dto);
  }
  update(dto: UpdateProductoDto): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(this.base, dto);   // el id va en el body
  }
  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
```
Consumo en componente (signals):
```ts
async load(): Promise<void> {
  this.loading.set(true);
  try {
    const res = await lastValueFrom(this.service.list({ page: this.page(), rows: this.pageSize(), search: this.search() || null }));
    this.rows.set(res.data.content);
    this.total.set(res.data.total);
  } catch (e: unknown) {
    this.rows.set([]);
    this.alert.error('No se pudo cargar la lista');
  } finally {
    this.loading.set(false);
  }
}
```

## Autenticación y sesión
```ts
// core/models/auth.model.ts — calcado del TokenResponseDto del backend
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;       // 'Bearer'
  expiresIn: number;       // segundos
  usuarioId: number;
  username: string;
  empresaId: number;
  permisos: string[];
}
```
- Login: `POST /api/auth/login` `{ username, password }` → `ApiResponse<TokenResponse>`.
- Refresh: `POST /api/auth/refresh` `{ refreshToken }` → `ApiResponse<TokenResponse>`.
- La sesión se guarda en **IndexedDB** (localforage, `index-db.service.ts`). `getToken()` → `accessToken`.
- `empresaId`/`usuarioId` salen del token; el backend los toma del JWT (NO se envían en los DTOs).

## Interceptor (funcional)
- `auth.interceptor.ts` (HttpInterceptorFn): añade `Authorization: Bearer <accessToken>` (salvo FormData),
  y en **401** limpia sesión + redirige a `/login` + alerta "Sesión expirada". Registrar con
  `provideHttpClient(withInterceptors([authInterceptor]))`.

## Moneda
```ts
export const formatCOP = (v: number): string =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v ?? 0);
```

## environment
```ts
export const environment = { production: false, apiUrl: 'http://localhost:8081/api/' }; // slash final
```
