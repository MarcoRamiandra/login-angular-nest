import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '../../i18n';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  template: `
    <div style="text-align:center; padding: 4rem;">
      <h1>{{ t().forbidden.title }}</h1>
      <p>{{ t().forbidden.message }}</p>
      <button (click)="goBack()">{{ t().forbidden.back }}</button>
    </div>
  `,
})
export class ForbiddenComponent {
  private router = inject(Router);
  private translator = inject(TranslationService);
  t = this.translator.translations;

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
