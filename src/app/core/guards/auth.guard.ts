import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, map } from 'rxjs';

import { IndexDbService } from '../services/index-db.service';

/** Permite la ruta si hay sesión en IndexedDB; si no, redirige a /login. */
export const authGuard: CanActivateFn = () => {
  const db = inject(IndexDbService);
  const router = inject(Router);
  return from(db.isAuthenticated()).pipe(
    map((authenticated) => (authenticated ? true : router.createUrlTree(['/login']))),
  );
};
