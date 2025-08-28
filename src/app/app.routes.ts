import { Routes } from '@angular/router';
import { ArticlesPage } from './pages/articles/articles.page';
import { WritersPage } from './pages/writers/writers.page';
import { LoginPage } from './pages/login/login.page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 👇 Default route → go to login
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Public route
  { path: 'login', component: LoginPage },

  // Protected routes
  { path: 'article', component: ArticlesPage, canMatch: [authGuard] },
  { path: 'writer', component: WritersPage, canMatch: [authGuard] },

  // Aliases
  { path: 'articles', redirectTo: 'article', pathMatch: 'full' },
  { path: 'writers', redirectTo: 'writer', pathMatch: 'full' },

  // Fallback → also go to login
  { path: '**', redirectTo: 'login' }
];
