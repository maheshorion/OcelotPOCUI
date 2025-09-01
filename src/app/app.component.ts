// src/app/app.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="top" *ngIf="showHeader()">
      <div class="brand">OcelotPOCUI</div>

      <nav class="menu">
        <a routerLink="/article" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Articles</a>
        <a routerLink="/writer" routerLinkActive="active">Writers</a>
        <a class="logout" (click)="logout()">Logout</a>

        <!-- Theme toggle (logic unchanged) -->
        <button class="theme-toggle" type="button" (click)="toggleTheme()">
          {{ isDark ? 'Light' : 'Dark' }} Mode
        </button>
      </nav>
    </header>

    <main class="page">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    /* === Theme tokens (light) === */
    :root {
      --page-bg: #f6f8ff;

      /* BAR colors (menu/section headers) */
      --bar-bg: #2563eb;          /* blue in normal mode */
      --bar-on: #ffffff;

      /* Link color when placed on the bar */
      --bar-link: var(--bar-on);
    }

    /* === Theme tokens (dark) === */
    .theme-dark {
      --page-bg: #0b1020;

      /* high-contrast bar in dark */
      --bar-bg: #1e293b;          /* dark navy */
      --bar-on: #e2e8f0;
      --bar-link: var(--bar-on);
    }

    :host { display:block; background:var(--page-bg); min-height:100dvh; }

    /* Top menu bar uses the bar tokens */
    .top {
      position: sticky; top: 0; z-index: 10;

      display:flex; justify-content:space-between; align-items:center;
      padding:10px 12px;

      background:var(--bar-bg);
      color:var(--bar-on);

      /* subtle separation from page content */
      box-shadow: 0 2px 10px rgba(0,0,0,.08);
    }

    .brand { font-weight:600; }

    .menu { display:flex; align-items:center; gap:16px; }
    .menu a {
      color:var(--bar-link);
      text-decoration:none; font-size:13px; cursor:pointer;
    }
    .menu a.active { text-decoration:underline; }
    .menu .logout { opacity:.95; }

    .theme-toggle {
      border:1px solid color-mix(in oklab, var(--bar-on) 45%, transparent);
      background:transparent;
      color:var(--bar-on);
      padding:4px 10px; border-radius:999px; font-size:12px; cursor:pointer;
    }

    .page { padding: 8px 12px; }
  `]
})
export class AppComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  // keep current url reactive
  private url = signal<string>(this.router.url);
  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.url.set(this.router.url));
    this.initTheme();
  }

  // header shows only when logged in AND not on /login
  showHeader = () => this.auth.isAuthenticated() && !this.url().startsWith('/login');

  logout() { this.auth.logout(); }

  // --- Theme toggle (logic unchanged) ---
  isDark = false;
  private themeKey = 'ui.theme';

  private initTheme() {
    const saved = (localStorage.getItem(this.themeKey) as 'light' | 'dark' | null);
    const preferDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const mode = saved ?? (preferDark ? 'dark' : 'light');
    this.applyTheme(mode);
  }
  toggleTheme() {
    this.applyTheme(this.isDark ? 'light' : 'dark');
  }
  private applyTheme(mode: 'light' | 'dark') {
    this.isDark = mode === 'dark';
    const root = document.documentElement.classList;
    root.remove('theme-dark');
    if (this.isDark) root.add('theme-dark');
    localStorage.setItem(this.themeKey, mode);
  }
}
