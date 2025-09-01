import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

type AnyLoginResponse =
  | { token: string; role?: string; user?: AuthUser }
  | { accessToken: string; refreshToken?: string; user?: AuthUser; role?: string }
  | Record<string, unknown>; 

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = environment.apiBaseUrl; 

  
  readonly user = signal<AuthUser | null>(this.readUser());
  readonly accessToken = signal<string | null>(this.readToken());
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken());

 
  async login(username: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      debugger;
      const url = `${this.base}/auth-api/Auth/login`; 
   
      const resp = await this.http.post<AnyLoginResponse>(url, { username, password }).toPromise();

      const token = this.pickToken(resp);
      if (!token) throw new Error('No token returned from server.');

      
      const user: AuthUser = {
        ...(this.pickUser(resp) ?? {}),
        role: this.pickRole(resp) ?? undefined
      };

      this.persist({ token, user, refreshToken: this.pickRefreshToken(resp) });

      this.user.set(Object.keys(user).length ? user : null);
      this.accessToken.set(token);
      this.loading.set(false);
      return true;
    } catch (e: any) {
         if (e?.status === 401) {
      this.error.set('Invalid username or password.');
    } else if (e?.status === 0) {
      this.error.set('Cannot reach server. Please check your API or proxy settings.');
    } else {
      const msg = e?.error?.message || e?.message || 'Login failed.';
      this.error.set(msg);
    }
    this.loading.set(false);
    return false;
    }
  }

  logout(): void {
    localStorage.removeItem('auth.accessToken');
    localStorage.removeItem('auth.refreshToken');
    localStorage.removeItem('auth.user');
    this.user.set(null);
    this.accessToken.set(null);
    this.error.set(null);
    this.router.navigateByUrl('/login');
  }



  private pickToken(resp: AnyLoginResponse | undefined | null): string | null {
    if (!resp || typeof resp !== 'object') return null;
    const r = resp as any;
   
    return r.token ?? r.accessToken ?? null;
  }

  private pickRefreshToken(resp: AnyLoginResponse | undefined | null): string | null {
    if (!resp || typeof resp !== 'object') return null;
    const r = resp as any;
    return r.refreshToken ?? null;
  }

  private pickUser(resp: AnyLoginResponse | undefined | null): AuthUser | null {
    if (!resp || typeof resp !== 'object') return null;
    const r = resp as any;
    if (r.user && typeof r.user === 'object') return r.user as AuthUser;

    
    const possible: AuthUser = {
      id: r.userId ?? r.id,
      name: r.name ?? r.username,
      email: r.email,
    };
    return Object.values(possible).some(v => v != null) ? possible : null;
  }

  private pickRole(resp: AnyLoginResponse | undefined | null): string | null {
    if (!resp || typeof resp !== 'object') return null;
    const r = resp as any;
    return r.role ?? null;
  }

  private persist(args: { token: string; user?: AuthUser | null; refreshToken?: string | null }) {
    localStorage.setItem('auth.accessToken', args.token);
    if (args.refreshToken) localStorage.setItem('auth.refreshToken', args.refreshToken);
    if (args.user) localStorage.setItem('auth.user', JSON.stringify(args.user));
  }

  private readToken(): string | null {
    return localStorage.getItem('auth.accessToken');
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem('auth.user');
    try { return raw ? (JSON.parse(raw) as AuthUser) : null; } catch { return null; }
  }
}
