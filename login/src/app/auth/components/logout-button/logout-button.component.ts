import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  template: `
    <button
      class="btn-logout"
      [class]="variant()"
      (click)="logout()"
    >
      {{ label() }}
    </button>
  `,
  styles: [`
    .btn-logout {
      cursor: pointer;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .btn-logout:hover { opacity: 0.8; }

    .primary {
      background: #ef4444;
      color: white;
    }
    .ghost {
      background: transparent;
      color: #ef4444;
      border: 1px solid #ef4444;
    }
  `],
})
export class LogoutButtonComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  // inputs signaux — Angular 17+
  label = input<string>('Se déconnecter');
  variant = input<'primary' | 'ghost'>('primary');

  logout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
