import { Component, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RecoveryFlowService } from '../../../core/services/recovery-flow.service';

@Component({
  selector: 'app-recovery-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="steps-indicator">
          <div class="step" [class.active]="step >= 1" [class.completed]="step > 1">
            <span class="step-number">1</span>
            <span class="step-label">Email</span>
          </div>
          <div class="step-line" [class.active]="step > 1"></div>
          <div class="step" [class.active]="step >= 2" [class.completed]="step > 2">
            <span class="step-number">2</span>
            <span class="step-label">Código</span>
          </div>
          <div class="step-line" [class.active]="step > 2"></div>
          <div class="step" [class.active]="step >= 3" [class.completed]="step > 3">
            <span class="step-number">3</span>
            <span class="step-label">Nueva Pass</span>
          </div>
          <div class="step-line" [class.active]="step > 3"></div>
          <div class="step" [class.active]="step >= 4">
            <span class="step-number">4</span>
            <span class="step-label">Listo</span>
          </div>
        </div>

        <!-- Step 1: Email -->
        <div *ngIf="step === 1" class="step-content">
          <h2>🔐 Recuperar Contraseña</h2>
          <p class="info-message">
            Ingresa tu email registrado para recibir un código de verificación.
          </p>

          <form (ngSubmit)="requestCode()">
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

        <!-- Step 2: OTP Verification -->
        <div *ngIf="step === 2" class="step-content">
          <h2>📧 Verificar Código</h2>
          <p class="info-message">
            Ingresa el código de 8 caracteres enviado a <strong>{{ email }}</strong>
          </p>

          <div *ngIf="locked" class="lockout-message">
            Demasiados intentos. Intenta de nuevo en {{ lockoutSeconds }} segundos.
          </div>

          <form *ngIf="!locked" (ngSubmit)="verifyCode()">
            <div class="form-group">
              <label for="token">Código de verificación</label>
              <input
                type="text"
                id="token"
                [(ngModel)]="token"
                name="token"
                required
                maxlength="8"
                placeholder="Ej: AB12CD34"
                class="form-input code-input"
                autocomplete="off"
              />
            </div>

            <div class="attempts-info">Intentos: {{ attempts }}/{{ maxAttempts }}</div>

            <button type="submit" [disabled]="loading || token.length !== 8" class="btn-primary">
              {{ loading ? 'Verificando...' : 'Verificar Código' }}
            </button>
          </form>

          <div class="resend-section">
            <button
              type="button"
              (click)="resendCode()"
              [disabled]="resendCooldown > 0"
              class="btn-resend"
            >
              {{
                resendCooldown > 0
                  ? 'Reenviar en ' + resendCooldown + 's'
                  : '¿No recibiste el código? Reenviar'
              }}
            </button>
          </div>
        </div>

        <!-- Step 3: New Password -->
        <div *ngIf="step === 3" class="step-content">
          <h2>🔑 Nueva Contraseña</h2>
          <p class="info-message">Código verificado. Ingresa tu nueva contraseña.</p>

          <form (ngSubmit)="resetPassword()">
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

            <div *ngIf="passwordError" class="error-message">{{ passwordError }}</div>

            <button type="submit" [disabled]="loading || !canSubmit()" class="btn-primary">
              {{ loading ? 'Restableciendo...' : 'Cambiar Contraseña' }}
            </button>
          </form>
        </div>

        <!-- Step 4: Success -->
        <div *ngIf="step === 4" class="step-content">
          <div class="success-icon">✅</div>
          <h2>¡Contraseña Restablecida!</h2>
          <p class="success-text">Tu contraseña ha sido actualizada correctamente.</p>
          <p class="redirect-timer">
            Serás redirigido al login en {{ redirectCountdown }} segundos...
          </p>
          <button (click)="goToLogin()" class="btn-primary">Ir al Login ahora</button>
        </div>

        <!-- Messages -->
        <div *ngIf="error" class="error-message">{{ error }}</div>
        <div *ngIf="success && step !== 4" class="success-message">{{ success }}</div>

        <p *ngIf="step < 4" class="auth-link">
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
        max-width: 420px;
      }

      .steps-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
      }

      .step-number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #ddd;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.8rem;
        transition: all 0.3s;
      }

      .step.active .step-number {
        background: #667eea;
        color: white;
      }

      .step.completed .step-number {
        background: #27ae60;
        color: white;
      }

      .step-label {
        font-size: 0.65rem;
        color: #999;
      }

      .step.active .step-label {
        color: #667eea;
      }

      .step-line {
        width: 30px;
        height: 2px;
        background: #ddd;
        margin: 0 0.25rem;
        margin-bottom: 1rem;
        transition: background 0.3s;
      }

      .step-line.active {
        background: #667eea;
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

      .code-input {
        text-align: center;
        letter-spacing: 0.3rem;
        font-size: 1.2rem;
        text-transform: uppercase;
      }

      .attempts-info {
        text-align: center;
        color: #666;
        font-size: 0.85rem;
        margin-bottom: 1rem;
      }

      .lockout-message {
        text-align: center;
        color: #e74c3c;
        padding: 1rem;
        background: #fee;
        border-radius: 8px;
        margin-bottom: 1rem;
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

      .resend-section {
        margin-top: 1.5rem;
        text-align: center;
      }

      .btn-resend {
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        font-size: 0.9rem;
        text-decoration: underline;
      }

      .btn-resend:disabled {
        color: #999;
        cursor: not-allowed;
        text-decoration: none;
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

      .success-icon {
        font-size: 3rem;
        text-align: center;
        margin-bottom: 0.5rem;
      }

      .success-text {
        text-align: center;
        color: #27ae60;
        font-weight: 500;
        margin-bottom: 1rem;
      }

      .redirect-timer {
        text-align: center;
        color: #666;
        font-size: 0.85rem;
        margin-bottom: 1rem;
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
export class RecoveryFlowComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private recoveryService = inject(RecoveryFlowService);

  step = 1;
  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';

  loading = false;
  error = '';
  success = '';

  attempts = 0;
  maxAttempts = 5;
  locked = false;
  lockoutSeconds = 0;

  resendCooldown = 0;
  redirectCountdown = 15;

  private resendInterval: any;
  private lockoutInterval: any;
  private redirectInterval: any;

  ngOnInit() {
    const state = this.recoveryService.stateSignal();
    if (state.email) {
      this.email = state.email;
      if (state.otpVerified) {
        this.step = 3;
      } else if (state.email) {
        this.step = 2;
      }
    }
    this.attempts = state.attempts;
  }

  ngOnDestroy() {
    this.clearIntervals();
  }

  private clearIntervals() {
    if (this.resendInterval) clearInterval(this.resendInterval);
    if (this.lockoutInterval) clearInterval(this.lockoutInterval);
    if (this.redirectInterval) clearInterval(this.redirectInterval);
  }

  requestCode() {
    if (!this.email.trim()) {
      this.error = 'El email es requerido';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.step = 2;
        this.recoveryService.setEmail(this.email);
        this.success = response.message || 'Código enviado';
        this.startResendCooldown();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al solicitar código';
        this.cdr.detectChanges();
      },
    });
  }

  verifyCode() {
    if (this.locked) return;

    this.loading = true;
    this.error = '';

    this.authService.verifyResetCode(this.token).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.step = 3;
          this.recoveryService.markOtpVerified();
          this.success = response.message || 'Código verificado';
        } else {
          this.recoveryService.incrementAttempts();
          this.attempts = this.recoveryService.stateSignal().attempts;
          if (this.attempts >= this.maxAttempts) {
            this.locked = true;
            this.startLockoutCountdown();
            this.error = 'Demasiados intentos. Has sido bloqueado por 15 minutos.';
          } else {
            this.error = response.message || 'Código inválido';
          }
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        const allowed = this.recoveryService.incrementAttempts();
        this.attempts = this.recoveryService.stateSignal().attempts;

        if (!allowed) {
          this.locked = true;
          this.startLockoutCountdown();
          this.error = 'Demasiados intentos. Has sido bloqueado por 15 minutos.';
        } else {
          this.error = err.error?.message || 'Código inválido';
        }
        this.cdr.detectChanges();
      },
    });
  }

  resendCode() {
    if (this.resendCooldown > 0) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = response.message || 'Código reenviado';
        this.startResendCooldown();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al reenviar código';
        this.cdr.detectChanges();
      },
    });
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden';
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
      this.cdr.detectChanges();
      return;
    }

    this.passwordError = '';
    this.loading = true;
    this.error = '';

    this.authService.resetPassword(this.email, this.newPassword).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.step = 4;
          this.recoveryService.clear();
          this.startRedirectCountdown();
          this.cdr.detectChanges();
        } else {
          this.error = response.message || 'Error al restablecer contraseña';
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al restablecer contraseña';
        this.cdr.detectChanges();
      },
    });
  }

  goToLogin() {
    this.clearIntervals();
    this.router.navigate(['/auth/login']);
  }

  canSubmit(): boolean {
    return !!(
      this.newPassword &&
      this.newPassword.length >= 6 &&
      this.newPassword === this.confirmPassword
    );
  }

  private startResendCooldown() {
    this.resendCooldown = 900;
    this.resendInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendInterval);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private startLockoutCountdown() {
    this.lockoutSeconds = this.recoveryService.getRemainingLockoutSeconds();
    this.lockoutInterval = setInterval(() => {
      this.lockoutSeconds--;
      if (this.lockoutSeconds <= 0) {
        this.locked = false;
        this.attempts = 0;
        this.recoveryService.resetAttempts();
        clearInterval(this.lockoutInterval);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private startRedirectCountdown() {
    this.redirectCountdown = 15;
    this.redirectInterval = setInterval(() => {
      this.redirectCountdown--;
      if (this.redirectCountdown <= 0) {
        clearInterval(this.redirectInterval);
        this.router.navigate(['/auth/login']);
      }
      this.cdr.detectChanges();
    }, 1000);
  }
}
