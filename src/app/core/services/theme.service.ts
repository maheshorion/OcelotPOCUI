import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

type Mode = 'light' | 'dark';
type Role = 'admin' | 'editor' | 'viewer' | null;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private r: Renderer2;
  private modeKey = 'ui.mode';
  private roleKey = 'ui.role';

  constructor(rf: RendererFactory2) { this.r = rf.createRenderer(null, null); }

  init() {
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const saved = (localStorage.getItem(this.modeKey) as Mode) || (systemDark ? 'dark' : 'light');
    const savedRole = (localStorage.getItem(this.roleKey) as Role) || null;
    this.apply(saved, savedRole);
  }

  toggleMode() {
    const next: Mode = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
    this.apply(next, this.getRole());
    localStorage.setItem(this.modeKey, next);
  }

  setRole(role: Role) {
    this.apply(this.getMode(), role);
    role ? localStorage.setItem(this.roleKey, role) : localStorage.removeItem(this.roleKey);
  }

  private getMode(): Mode {
    return document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
  }
  private getRole(): Role {
    const list = document.documentElement.classList;
    if (list.contains('role-admin')) return 'admin';
    if (list.contains('role-editor')) return 'editor';
    if (list.contains('role-viewer')) return 'viewer';
    return null;
  }

  private apply(mode: Mode, role: Role) {
    const el = document.documentElement;
    ['theme-dark','theme-light','role-admin','role-editor','role-viewer'].forEach(c=>this.r.removeClass(el, c));
    this.r.addClass(el, mode === 'dark' ? 'theme-dark' : 'theme-light');
    if (role) this.r.addClass(el, `role-${role}`);
  }
}
