import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import {
  provideHttpClient,
  withInterceptors,
  HttpInterceptorFn
} from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';

const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth.accessToken');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),  
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations()
  ]
};
