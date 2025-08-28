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
      </nav>
    </header>

    <main class="page">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host { display:block; }
    .top { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#3f51b5; color:#fff; }
    .brand { font-weight:600; }
    .menu a { margin-left:16px; color:#fff; text-decoration:none; font-size:13px; cursor:pointer; }
    .menu a.active { text-decoration:underline; }
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
  }

  // header shows only when logged in AND not on /login
  showHeader = () => this.auth.isAuthenticated() && !this.url().startsWith('/login');

  logout() {
    this.auth.logout(); // clears token and navigates to /login
  }
}
