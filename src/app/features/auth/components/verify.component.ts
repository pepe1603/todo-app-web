import { Component, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="verify-container">
      <div class="verify-card">
        <h2>Verificar Cuenta</h2>

        <p class="info-message" *ngIf="email">
          Ingresa el código enviado a <strong>{{ email }}</strong>
        </p>

        <div *ngIf="step === 'email'" class="email-step">
          <form (ngSubmit)="setEmail()">
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
            <button type="submit" [disabled]="loading" class="btn-primary">Continuar</button>
          </form>
        </div>

        <div *ngIf="step === 'otp'" class="otp-step">
          <form (ngSubmit)="verifyOtp()">
            <div class="form-group">
              <label for="otp">Código OTP</label>
              <input
                type="text"
                id="otp"
                [(ngModel)]="otp"
                name="otp"
                required
                maxlength="6"
                placeholder="Ingresa los 6 dígitos"
                class="otp-input"
              />
            </div>

            <button type="submit" [disabled]="loading" class="btn-primary">
              {{ loading ? 'Verificando...' : 'Verificar Cuenta' }}
            </button>
          </form>

          <button (click)="resendOtp()" [disabled]="resendDisabled" class="btn-link">
            {{ resendDisabled ? 'Espera ' + resendCountdown + 's' : 'Reenviar código' }}
          </button>
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
      .verify-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .verify-card {
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

      .otp-input {
        text-align: center;
        font-size: 1.5rem;
        letter-spacing: 0.5rem;
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

      .info-message {
        text-align: center;
        color: #666;
        margin-bottom: 1.5rem;
      }

      .error-message {
        color: red;
        margin-top: 1rem;
        padding: 0.5rem;
        background: #fee;
        border-radius: 5px;
        text-align: center;
      }

      .success-message {
        color: green;
        margin-top: 1rem;
        padding: 0.5rem;
        background: #efe;
        border-radius: 5px;
        text-align: center;
      }

      .auth-link {
        text-align: center;
        margin-top: 1.5rem;
      }

      .auth-link a {
        color: #667eea;
        text-decoration: none;
      }
    `,
  ],
})
export class VerifyComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  step: 'email' | 'otp' = 'email';
  email = '';
  otp = '';
  loading = false;
  error = '';
  success = '';

  resendDisabled = false;
  resendCountdown = 0;
  private resendInterval: any;

  ngOnInit() {
    const emailParam = this.route.snapshot.queryParams['email'];
    const resendParam = this.route.snapshot.queryParams['resend'];

    if (emailParam) {
      this.email = emailParam;
      this.step = 'otp';

      if (resendParam === 'true') {
        this.sendOtp();
      }
    }
  }

  private sendOtp() {
    if (!this.email) return;

    this.loading = true;
    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Código enviado a tu email';
        this.startResendCountdown();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al enviar código';
        this.cdr.detectChanges();
      },
    });
  }

  setEmail() {
    if (this.email) {
      this.step = 'otp';
    }
  }

  verifyOtp() {
    if (!this.email || !this.otp) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = '¡Cuenta verificada! Redirigiendo...';
        setTimeout(() => {
          this.router.navigate(['/tasks']);
        }, 1500);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Código inválido';
        }
        this.cdr.detectChanges();
      },
    });
  }

  resendOtp() {
    if (!this.email) return;

    this.success = '';
    this.error = '';

    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.success = 'Código reenviado';
        this.startResendCountdown();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al reenviar';
        this.cdr.detectChanges();
      },
    });
  }

  private startResendCountdown() {
    this.resendDisabled = true;
    this.resendCountdown = 60;
    if (this.resendInterval) clearInterval(this.resendInterval);
    this.resendInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.resendDisabled = false;
        clearInterval(this.resendInterval);
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.resendInterval) clearInterval(this.resendInterval);
  }
}
