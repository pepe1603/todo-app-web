import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Crear Cuenta</h2>

        <div *ngIf="step === 'form'" class="form-step">
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="fullName">Nombre completo</label>
              <input
                type="text"
                id="fullName"
                [(ngModel)]="fullName"
                name="fullName"
                required
                placeholder="Ingresa tu nombre"
              />
            </div>

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
                minlength="6"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button type="submit" [disabled]="loading" class="btn-primary">
              {{ loading ? 'Registrando...' : 'Registrarse' }}
            </button>
          </form>

          <p class="auth-link">¿Ya tienes cuenta? <a routerLink="/auth/login">Iniciar sesión</a></p>
        </div>

        <div *ngIf="step === 'otp'" class="otp-step">
          <p class="info-message">
            Se ha enviado un código de verificación a <strong>{{ email }}</strong>
          </p>

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
              {{ loading ? 'Verificando...' : 'Verificar' }}
            </button>
          </form>

          <button (click)="resendOtp()" [disabled]="resendDisabled" class="btn-link">
            {{ resendDisabled ? 'Espera ' + resendCountdown + 's' : 'Reenviar código' }}
          </button>
        </div>

        <div *ngIf="error" class="error-message">{{ error }}</div>
        <div *ngIf="success" class="success-message">{{ success }}</div>
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

      .success-message {
        color: green;
        margin-top: 1rem;
        padding: 0.5rem;
        background: #efe;
        border-radius: 5px;
        text-align: center;
      }

      .info-message {
        text-align: center;
        color: #666;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  step: 'form' | 'otp' = 'form';
  fullName = '';
  email = '';
  password = '';
  otp = '';

  loading = false;
  error = '';
  success = '';

  resendDisabled = false;
  resendCountdown = 0;

  onSubmit() {
    this.loading = true;
    this.error = '';
    console.log('Registrando usuario:', this.email);

    const data: RegisterRequest = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
    };

    this.authService.register(data).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.loading = false;
        this.step = 'otp';
        this.success = response.message;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.log('Error en registro:', err);
        if (err.status === 0) {
          this.error = 'No se puede conectar al servidor';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al registrar';
        }
        this.cdr.detectChanges();
      },
    });
  }

  verifyOtp() {
    this.loading = true;
    this.error = '';
    console.log('Verificando OTP para:', this.email);

    this.authService.verifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: (response) => {
        console.log('OTP verificado:', response);
        this.loading = false;
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.loading = false;
        console.log('Error en verificación:', err);
        if (err.status === 0) {
          this.error = 'No se puede conectar al servidor';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Código inválido';
        }
        this.cdr.detectChanges();
      },
    });
  }

  resendOtp() {
    console.log('Reenviando OTP a:', this.email);
    this.success = '';
    this.error = '';

    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        console.log('OTP reenviado');
        this.success = 'Código reenviado';
        this.startResendCountdown();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al reenviar:', err);
        if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Error al reenviar';
        }
        this.cdr.detectChanges();
      },
    });
  }

  private startResendCountdown() {
    this.resendDisabled = true;
    this.resendCountdown = 60;
    const interval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.resendDisabled = false;
        clearInterval(interval);
      }
    }, 1000);
  }
}
