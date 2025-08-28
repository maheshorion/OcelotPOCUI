import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const httpErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Add a simple default header; extend later if needed
  const cloned = req.clone({ setHeaders: { Accept: 'application/json' } });
  return next(cloned);
};
