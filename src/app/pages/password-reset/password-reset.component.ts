import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  password = signal('');
  confirmPassword = signal('');
  token = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  passwordsMatch = computed(() => this.password() === this.confirmPassword());
  
  isFormValid = computed(() => {
    return this.password().length >= 6 && this.passwordsMatch();
  });

  ngOnInit() {
    this.token.set(this.route.snapshot.queryParams['token'] || '');
  }

  onSubmit() {
    if (!this.isFormValid() || !this.token()) return;

    this.isLoading.set(true);
    this.authService.resetPassword(this.token(), this.password()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('O link de recuperação expirou ou é inválido.');
      }
    });
  }
}