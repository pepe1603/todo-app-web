import { Injectable, signal } from '@angular/core';

export interface RecoveryFlowState {
  email: string;
  otpVerified: boolean;
  attempts: number;
  maxAttempts: number;
  lockoutUntil: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class RecoveryFlowService {
  private state = signal<RecoveryFlowState>({
    email: '',
    otpVerified: false,
    attempts: 0,
    maxAttempts: 5,
    lockoutUntil: null,
  });

  readonly stateSignal = this.state.asReadonly();

  setEmail(email: string): void {
    this.state.update((s) => ({ ...s, email }));
  }

  markOtpVerified(): void {
    this.state.update((s) => ({ ...s, otpVerified: true }));
  }

  incrementAttempts(): boolean {
    let allowed = false;
    this.state.update((s) => {
      const newAttempts = s.attempts + 1;
      if (newAttempts >= s.maxAttempts) {
        return { ...s, attempts: newAttempts, lockoutUntil: Date.now() + 15 * 60 * 1000 };
      }
      allowed = true;
      return { ...s, attempts: newAttempts };
    });
    return allowed;
  }

  resetAttempts(): void {
    this.state.update((s) => ({ ...s, attempts: 0, lockoutUntil: null }));
  }

  isLocked(): boolean {
    const state = this.state();
    if (!state.lockoutUntil) return false;
    if (Date.now() > state.lockoutUntil) {
      this.resetAttempts();
      return false;
    }
    return true;
  }

  getRemainingLockoutSeconds(): number {
    const state = this.state();
    if (!state.lockoutUntil) return 0;
    return Math.max(0, Math.ceil((state.lockoutUntil - Date.now()) / 1000));
  }

  clear(): void {
    this.state.set({
      email: '',
      otpVerified: false,
      attempts: 0,
      maxAttempts: 5,
      lockoutUntil: null,
    });
  }
}
