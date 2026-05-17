import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../auth/store/auth.store';
import { take } from 'rxjs';

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

  // signaux exposés au template
  isLoading = this.authStore.isLoading;
  hasError = this.authStore.hasError;
  error = this.authStore.error;
  isSessionExpired = this.authStore.isSessionExpired;

  // returnUrl récupéré depuis les queryParams
  private returnUrl = '/dashboard';

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';

    // si déjà connecté → redirection immédiate
    if (this.authStore.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }

    // on remet sessionExpired à false dès que l'utilisateur
    // commence à interagir avec le formulaire
    this.form.valueChanges.pipe(take(1)).subscribe(() => {
      if (this.authStore.isSessionExpired()) {
        this.authStore.logout(); // reset sessionExpired → false
      }
    });
  }

  // messages d'erreur des champs
  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control || !control.invalid || !control.touched) return null;

    if (control.hasError('required')) return 'Ce champ est obligatoire.';
    if (control.hasError('email')) return 'Email invalide.';
    if (control.hasError('minlength')) return 'Minimum 6 caractères.';

    return null;
  }

  // message d'erreur du store — mappé depuis le code
  get storeErrorMessage(): string | null {
    const code = this.error()?.code;
    if (!code) return null;

    const messages: Record<string, string> = {
      invalid_credentials: 'Email ou mot de passe incorrect.',
      account_locked: 'Compte bloqué. Contactez l\'administrateur.',
      network_error: 'Erreur réseau. Vérifiez votre connexion.',
      session_expired: 'Session expirée. Veuillez vous reconnecter.',
      unknown: 'Une erreur inattendue est survenue.',
    };

    return messages[code] ?? messages['unknown'];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;

    // on écoute le changement de status pour savoir quand c'est fini
    const checkSuccess = setInterval(() => {
      if (this.authStore.status() === 'success') {
        clearInterval(checkSuccess);
        this.router.navigateByUrl(this.returnUrl);
      }
      if (this.authStore.status() === 'error') {
        clearInterval(checkSuccess);
        // le store a déjà mis à jour error() — le template réagit seul
      }
    }, 50);

    this.authStore.login({ email, password });
  }
}
