import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TwoFaComponent } from '../two-fa/two-fa.component';
import { Router } from '@angular/router';

type RecoveryStep = 'email' | 'code';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, TwoFaComponent],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  step = signal<RecoveryStep>('email');
  email = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  requestRecoveryCode() {
    if (!this.email()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.email()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set('code'); 
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Não foi possível processar a solicitação. Verifique o e-mail.');
      }
    });
  }

  onCodeVerified(code: string) {
    console.log('Código validado:', code);
    this.router.navigate(['/password-reset'], { queryParams: { token: code } });
  }
}