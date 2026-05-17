import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthStore } from './auth/store/auth.store';
import { authInterceptor } from './auth/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAppInitializer(() => {
      const authStore = inject(AuthStore);

      return new Promise<void>((resolve) => {
        authStore.restoreSession();

        const interval = setInterval(() => {
          if (authStore.status() !== 'loading') {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }),
  ],
};
