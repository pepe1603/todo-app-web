import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login.component';
import { RegisterComponent } from './features/auth/components/register.component';
import { VerifyComponent } from './features/auth/components/verify.component';
import { RecoveryFlowComponent } from './features/auth/components/recovery-flow.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/verify', component: VerifyComponent },
  { path: 'auth/recovery', component: RecoveryFlowComponent },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/components/tasks.component').then((m) => m.TasksComponent),
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];
