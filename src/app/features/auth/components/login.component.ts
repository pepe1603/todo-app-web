import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Iniciar Sesión</h2>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="Ingresa tu email"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary">
            {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <p class="auth-link">¿No tienes cuenta? <a routerLink="/auth/register">Regístrate</a></p>

        <div *ngIf="error" class="error-message">{{ error }}</div>

        <div *ngIf="needsVerification" class="verification-help">
          <p class="info-text">Tu cuenta no ha sido verificada.</p>
          <button type="button" (click)="resendOtp()" class="btn-secondary">
            Reenviar código OTP
          </button>
        </div>
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
      }

      .auth-card {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        color: #333;
        margin-bottom: 1.5rem;
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

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
      }

      .btn-primary {
        width: 100%;
        padding: 0.75rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
      }

      .btn-primary:disabled {
        background: #ccc;
      }

      .auth-link {
        text-align: center;
        margin-top: 1rem;
        color: #666;
      }

      .auth-link a {
        color: #667eea;
        text-decoration: none;
      }

      .error-message {
        color: red;
        margin-top: 1rem;
        padding: 0.5rem;
        background: #fee;
        border-radius: 5px;
        text-align: center;
      }

      .verification-help {
        margin-top: 1rem;
        padding: 1rem;
        background: #fff3cd;
        border-radius: 5px;
        text-align: center;
      }

      .info-text {
        color: #856404;
        margin-bottom: 0.5rem;
      }

      .btn-secondary {
        width: 100%;
        padding: 0.75rem;
        background: #ffc107;
        color: #333;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
      }
    `,
  ],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  loading = false;
  error = '';
  needsVerification = false;
  verificationEmail = '';

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.needsVerification = false;
    this.verificationEmail = '';

    const data: LoginRequest = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(data).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.loading = false;
        this.router.navigate(['/tasks']);
      },
      error: (err: any) => {
        this.loading = false;
        console.log('Error completo:', err);

        if (err.status === 0) {
          this.error = 'No se puede conectar al servidor';
        } else if (err.status === 401) {
          const message = err.error?.message || '';
          if (message.includes('verifica') || message.includes('OTP')) {
            this.error = message;
            this.needsVerification = true;
            this.verificationEmail = this.email;
          } else {
            this.error = 'Credenciales inválidas';
          }
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al iniciar sesión';
        }

        this.cdr.detectChanges();
      },
    });
  }

  resendOtp() {
    if (!this.verificationEmail) return;

    this.authService.resendOtp(this.verificationEmail).subscribe({
      next: () => {
        this.error = 'Código reenviado. Revisa tu email.';
        this.needsVerification = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al reenviar código';
        this.cdr.detectChanges();
      },
    });
  }

  goToVerify() {
    this.router.navigate(['/auth/verify'], {
      queryParams: { email: this.verificationEmail },
    });
  }
}
