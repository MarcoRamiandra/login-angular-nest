import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './auth/store/auth.store';
import { LogoutButtonComponent } from './auth/components/logout-button/logout-button.component';
import { TranslationService } from './i18n';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LogoutButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  authStore = inject(AuthStore);
  private translator = inject(TranslationService);

  readonly currentLang = this.translator.lang;
  switchLang() {
    this.translator.switchLang(this.currentLang() === 'fr' ? 'en' : 'fr');
  }
}
