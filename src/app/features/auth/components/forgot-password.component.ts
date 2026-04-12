import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>🔐 Recuperar Contraseña</h2>

        <div *ngIf="step === 'email'" class="email-step">
          <p class="info-message">
            Ingresa tu email registrado. Te enviaremos un código para restablecer tu contraseña.
          </p>

          <form (ngSubmit)="requestToken()">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="tu@email.com"
                class="form-input"
              />
            </div>

            <button type="submit" [disabled]="loading" class="btn-primary">
              {{ loading ? 'Enviando...' : 'Continuar' }}
            </button>
          </form>
        </div>

        <div *ngIf="step === 'sent'" class="sent-step">
          <div class="success-icon">✉️</div>
          <p class="success-message">
            Código enviado a <strong>{{ email }}</strong>
          </p>
          <p class="info-text">
            El código expira en 15 minutos. Si no lo recibes, puedes solicitar otro después de 15
            minutos.
          </p>

          <button (click)="requestToken()" [disabled]="resendDisabled" class="btn-secondary">
            {{ resendDisabled ? 'Espera ' + resendCountdown + 's' : 'Reenviar código' }}
          </button>

          <button (click)="goToReset()" class="btn-link">Tengo el código →</button>
        </div>

        <div *ngIf="error" class="error-message">{{ error }}</div>
        <div *ngIf="success" class="success-message">{{ success }}</div>

        <p class="auth-link">
          <a routerLink="/auth/login">← Volver a Iniciar Sesión</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
      }

      .auth-card {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        color: #333;
        margin-bottom: 1.5rem;
      }

      .info-message,
      .info-text {
        text-align: center;
        color: #666;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #555;
        font-weight: 500;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
      }

      .form-input:focus {
        outline: none;
        border-color: #667eea;
      }

      .btn-primary {
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        font-weight: 500;
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-secondary {
        width: 100%;
        padding: 0.75rem;
        background: #f39c12;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
      }

      .btn-secondary:disabled {
        background: #ccc;
      }

      .btn-link {
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        margin-top: 1rem;
        display: block;
        width: 100%;
        text-align: center;
      }

      .success-icon {
        font-size: 3rem;
        text-align: center;
        margin-bottom: 1rem;
      }

      .success-message {
        color: #27ae60;
        text-align: center;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      .error-message {
        color: #e74c3c;
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fee;
        border-radius: 8px;
        text-align: center;
      }

      .success-message:not(.error-message) {
        color: green;
        margin-top: 1rem;
        padding: 0.75rem;
        background: #efe;
        border-radius: 8px;
        text-align: center;
      }

      .auth-link {
        text-align: center;
        margin-top: 1.5rem;
        color: #666;
      }

      .auth-link a {
        color: #667eea;
        text-decoration: none;
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  step: 'email' | 'sent' = 'email';
  email = '';
  loading = false;
  error = '';
  success = '';

  resendDisabled = false;
  resendCountdown = 0;

  requestToken() {
    if (!this.email.trim()) {
      this.error = 'El email es requerido';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    console.log('Solicitando código para:', this.email);

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        console.log('Código enviado:', response);
        this.loading = false;
        this.step = 'sent';
        this.success = response.message || 'Código enviado';
        this.startResendCountdown();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('Error completo:', err);
        this.loading = false;
        if (err.status === 0) {
          this.error = 'No se puede conectar al servidor. ¿Está la API funcionando?';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al solicitar código. Intenta de nuevo.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  goToReset() {
    this.router.navigate(['/auth/reset-password'], {
      queryParams: { email: this.email },
    });
  }

  private startResendCountdown() {
    this.resendDisabled = true;
    this.resendCountdown = 900; // 15 minutos = 900 segundos
    const interval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.resendDisabled = false;
        clearInterval(interval);
      }
      this.cdr.detectChanges();
    }, 1000);
  }
}
