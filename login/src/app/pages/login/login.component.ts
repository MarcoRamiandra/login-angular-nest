import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../auth/store/auth.store';
import { take } from 'rxjs';
import { TranslationService } from '../../i18n';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authStore = inject(AuthStore);
  private translator = inject(TranslationService);
  readonly t = this.translator.translations;

  isLoading = this.authStore.isLoading;
  hasError = this.authStore.hasError;
  error = this.authStore.error;
  isSessionExpired = this.authStore.isSessionExpired;

  private returnUrl = '/dashboard';

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';

    if (this.authStore.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }

    this.form.valueChanges.pipe(take(1)).subscribe(() => {
      if (this.authStore.isSessionExpired()) {
        this.authStore.logout();
      }
    });
  }

  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control || !control.invalid || !control.touched) return null;
    return this.translator.fieldError(field, control.errors ?? {});
  }

  get storeErrorMessage(): string | null {
    return this.translator.errorCodeMessage(this.error()?.code);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;

    const checkSuccess = setInterval(() => {
      if (this.authStore.status() === 'success') {
        clearInterval(checkSuccess);
        this.router.navigateByUrl(this.returnUrl);
      }
      if (this.authStore.status() === 'error') {
        clearInterval(checkSuccess);
      }
    }, 50);

    this.authStore.login({ email, password });
  }
}
