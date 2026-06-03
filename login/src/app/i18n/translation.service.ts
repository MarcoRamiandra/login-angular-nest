import { Injectable, signal, computed } from '@angular/core';
import { Lang, Translations, fr, en } from './translations';
import { HttpErrorResponse } from '@angular/common/http';

const STORAGE_KEY = 'app_lang';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLang = signal<Lang>(this.loadLang());
  readonly translations = computed<Translations>(() =>
    this.currentLang() === 'fr' ? fr : en,
  );

  readonly lang = this.currentLang.asReadonly();

  switchLang(lang: Lang): void {
    this.currentLang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  errorCodeMessage(code: string | undefined | null): string | null {
    if (!code) return null;
    const t = this.translations();
    const map: Record<string, string> = {
      invalid_credentials: t.login.error_invalid_credentials,
      account_locked: t.login.error_account_locked,
      network_error: t.login.error_network,
      session_expired: t.login.error_session_expired,
      unknown: t.login.error_unknown,
    };
    return map[code] ?? t.login.error_unknown;
  }

  fieldError(field: string, errors: Record<string, unknown>): string | null {
    const t = this.translations();
    if (errors['required']) return t.login.field_required;
    if (errors['email']) return t.login.field_email_invalid;
    if (errors['minlength']) return t.login.field_minlength;
    return null;
  }

  private loadLang(): Lang {
    if (typeof localStorage === 'undefined') return 'fr';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
    return 'fr';
  }
}
