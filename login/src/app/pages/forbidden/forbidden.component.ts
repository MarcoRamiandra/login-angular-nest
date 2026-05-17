import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  template: `
    <div style="text-align:center; padding: 4rem;">
      <h1>403</h1>
      <p>Vous n'avez pas accès à cette page.</p>
      <button (click)="goBack()">Retour</button>
    </div>
  `,
})
export class ForbiddenComponent {
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
