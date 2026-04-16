import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login.component';
import { RegisterComponent } from './features/auth/components/register.component';
import { VerifyComponent } from './features/auth/components/verify.component';
import { RecoveryFlowComponent } from './features/auth/components/recovery-flow.component';
import { SwaggerViewerComponent } from './features/swagger/components/swagger-viewer.component';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'auth/verify',
    component: VerifyComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'auth/recovery',
    component: RecoveryFlowComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/components/tasks.component').then((m) => m.TasksComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'swagger',
    component: SwaggerViewerComponent,
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];
