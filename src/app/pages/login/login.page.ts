import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private ar = inject(ActivatedRoute);
  private auth = inject(AuthService);

  hide = true;

  form = this.fb.group({
    username: ['', [Validators.required]],   // your API expects "username"
    password: ['', [Validators.required]]
  });

  // expose to template
  get loading() { return this.auth.loading(); }
  get error()   { return this.auth.error(); }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { username, password } = this.form.value as { username: string; password: string };
    const ok = await this.auth.login(username, password);
    if (ok) {
      const returnUrl = this.ar.snapshot.queryParamMap.get('returnUrl') || '/article';
      this.router.navigateByUrl(returnUrl);
    }
  }
}
