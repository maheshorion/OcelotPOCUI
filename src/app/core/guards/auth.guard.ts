import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanMatchFn = (_route, segments) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth.accessToken');

  console.log('[authGuard] checking', segments.map(s => s.path).join('/'), 'token?', !!token);

  if (token) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: '/' + segments.map(s => s.path).join('/') } });
  return false;
};
