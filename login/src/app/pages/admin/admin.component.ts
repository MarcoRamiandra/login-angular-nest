import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, SlicePipe } from '@angular/common';
import { AuthStore } from '../../auth/store/auth.store';
import { TranslationService } from '../../i18n';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SlicePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  authStore = inject(AuthStore);
  t = inject(TranslationService).translations;
}
