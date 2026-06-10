// Contrato de autenticación — calcado del backend Nyxora (AuthController / TokenResponseDto).

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

/** Respuesta de /api/auth/login y /api/auth/refresh (campo `data` de ApiResponse). */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // 'Bearer'
  expiresIn: number; // segundos
  usuarioId: number;
  username: string;
  empresaId: number;
  permisos: string[];
}
