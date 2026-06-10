import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { AlertService } from '../../shared/services/alert.service';
import { AuthService } from '../services/auth.service';
import { IndexDbService } from '../services/index-db.service';

/** Añade Authorization: Bearer <token> y maneja 401 global (cierra sesión + redirige a login). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const db = inject(IndexDbService);
  const auth = inject(AuthService);
  const alert = inject(AlertService);
  const router = inject(Router);

  return from(db.getToken()).pipe(
    switchMap((token) => {
      const request =
        token && !(req.body instanceof FormData)
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: '*/*' } })
          : req;

      return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            alert.error('Vuelva a iniciar sesión', 'Sesión expirada');
            void auth.logout();
            void router.navigate(['/login']);
          }
          return throwError(() => error.error ?? error);
        }),
      );
    }),
  );
};
