export type Lang = 'fr' | 'en';

export type Translations = typeof fr;

export const fr = {
  login: {
    title: 'Connexion',
    subtitle: 'Connectez-vous à votre compte',
    session_expired: 'Votre session a expiré. Veuillez vous reconnecter.',
    email_label: 'Adresse email',
    email_placeholder: 'admin@app.com',
    password_label: 'Mot de passe',
    password_placeholder: '••••••••',
    remember_me: 'Se souvenir de moi',
    forgot_password: 'Mot de passe oublié ?',
    submitting: 'Connexion...',
    submit: 'Se connecter',
    field_required: 'Ce champ est obligatoire.',
    field_email_invalid: 'Email invalide.',
    field_minlength: 'Minimum 6 caractères.',
    error_invalid_credentials: 'Email ou mot de passe incorrect.',
    error_account_locked: 'Compte bloqué. Contactez l\'administrateur.',
    error_network: 'Erreur réseau. Vérifiez votre connexion.',
    error_session_expired: 'Session expirée. Veuillez vous reconnecter.',
    error_unknown: 'Une erreur inattendue est survenue.',
  },
  admin: {
    role: 'Rôle :',
    authenticated: 'Authentifié :',
    session_expired: 'Session expirée :',
    access_token: 'Access token :',
    no_token: 'Aucun token',
    yes: 'Oui',
    no: 'Non',
  },
  forbidden: {
    title: '403',
    message: 'Vous n\'avez pas accès à cette page.',
    back: 'Retour',
  },
  logout: {
    button: 'Se déconnecter',
  },
};

export const en: Translations = {
  login: {
    title: 'Sign in',
    subtitle: 'Sign in to your account',
    session_expired: 'Your session has expired. Please sign in again.',
    email_label: 'Email address',
    email_placeholder: 'admin@app.com',
    password_label: 'Password',
    password_placeholder: '••••••••',
    remember_me: 'Remember me',
    forgot_password: 'Forgot password?',
    submitting: 'Signing in...',
    submit: 'Sign in',
    field_required: 'This field is required.',
    field_email_invalid: 'Invalid email.',
    field_minlength: 'Minimum 6 characters.',
    error_invalid_credentials: 'Incorrect email or password.',
    error_account_locked: 'Account locked. Contact the administrator.',
    error_network: 'Network error. Check your connection.',
    error_session_expired: 'Session expired. Please sign in again.',
    error_unknown: 'An unexpected error occurred.',
  },
  admin: {
    role: 'Role:',
    authenticated: 'Authenticated:',
    session_expired: 'Session expired:',
    access_token: 'Access token:',
    no_token: 'No token',
    yes: 'Yes',
    no: 'No',
  },
  forbidden: {
    title: '403',
    message: 'You do not have access to this page.',
    back: 'Go back',
  },
  logout: {
    button: 'Sign out',
  },
};
