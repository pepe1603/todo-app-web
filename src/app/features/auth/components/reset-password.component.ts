import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>🔑 Nueva Contraseña</h2>

        <p class="info-message">Ingresa el código de recuperación y tu nueva contraseña.</p>

        <form (ngSubmit)="resetPassword()">
          <div class="form-group">
            <label for="token">Código de recuperación</label>
            <input
              type="text"
              id="token"
              [(ngModel)]="token"
              name="token"
              required
              maxlength="32"
              placeholder="Código de 32 caracteres"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">Nueva contraseña</label>
            <input
              type="password"
              id="newPassword"
              [(ngModel)]="newPassword"
              name="newPassword"
              required
              minlength="6"
              placeholder="Mínimo 6 caracteres"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Repite la contraseña"
              class="form-input"
            />
          </div>

          <button type="submit" [disabled]="loading || !canSubmit()" class="btn-primary">
            {{ loading ? 'Restableciendo...' : 'Restablecer Contraseña' }}
          </button>
        </form>

        <button (click)="requestNewToken()" [disabled]="resendDisabled" class="btn-secondary">
          {{ resendDisabled ? 'Espera ' + resendCountdown + 's' : 'Solicitar nuevo código' }}
        </button>

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
        margin-bottom: 1rem;
      }

      .info-message {
        text-align: center;
        color: #666;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
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
        box-sizing: border-box;
      }

      .form-input:focus {
        outline: none;
        border-color: #667eea;
      }

      .btn-primary {
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        font-weight: 500;
        margin-top: 0.5rem;
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

      .error-message {
        color: #e74c3c;
        margin-top: 1rem;
        padding: 0.75rem;
        background: #fee;
        border-radius: 8px;
        text-align: center;
      }

      .success-message {
        color: #27ae60;
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
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';

  resendDisabled = false;
  resendCountdown = 0;

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
  }

  canSubmit(): boolean {
    return !!(
      this.token.trim() &&
      this.newPassword &&
      this.newPassword.length >= 6 &&
      this.newPassword === this.confirmPassword
    );
  }

  resetPassword() {
    if (!this.canSubmit()) {
      if (this.newPassword !== this.confirmPassword) {
        this.error = 'Las contraseñas no coinciden';
      } else if (this.newPassword.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres';
      } else {
        this.error = 'Completa todos los campos';
      }
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (message) => {
        this.loading = false;
        this.success = message + ' Redirigiendo al login...';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al restablecer contraseña';
        this.cdr.detectChanges();
      },
    });
  }

  requestNewToken() {
    if (!this.email) {
      this.error =
        'No hay email registrado. Solicita un nuevo código desde la página de recuperación.';
      this.cdr.detectChanges();
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.success = 'Nuevo código enviado';
        this.startResendCountdown();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al solicitar código';
        this.cdr.detectChanges();
      },
    });
  }

  private startResendCountdown() {
    this.resendDisabled = true;
    this.resendCountdown = 900;
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
