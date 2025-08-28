// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';

import { routes } from './app/app.routes';

// ---- Inline JWT interceptor (no external module, no TS2306) ----
const authInterceptor: HttpInterceptorFn = (req, next) => {
  // read token from localStorage (or inject AuthService if you prefer signals)
  const token = localStorage.getItem('auth.accessToken');
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq);
};

const mergedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),

    // router
    provideRouter(routes, withComponentInputBinding()),

    // http + interceptor
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};

bootstrapApplication(AppComponent, mergedConfig).catch(err => console.error(err));
