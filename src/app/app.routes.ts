import { Routes } from '@angular/router';
import { ArticlesPage } from './pages/articles/articles.page';
import { WritersPage } from './pages/writers/writers.page';
import { LoginPage } from './pages/login/login.page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'article' },
  { path: 'login', component: LoginPage },
  { path: 'article', component: ArticlesPage, canMatch: [authGuard] },
  { path: 'writer', component: WritersPage, canMatch: [authGuard] },
  { path: 'articles', redirectTo: 'article', pathMatch: 'full' },
  { path: 'writers', redirectTo: 'writer', pathMatch: 'full' },
  { path: '**', redirectTo: 'article' }
];
