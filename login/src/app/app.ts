import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './auth/store/auth.store';
import { LogoutButtonComponent } from './auth/components/logout-button/logout-button.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LogoutButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  authStore = inject(AuthStore);
}
