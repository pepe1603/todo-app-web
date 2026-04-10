import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService, Task } from '../../../core/services/task.service';
import { TaskStats } from '../models/task-stats';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tasks-container">
      <header>
        <h1>Mis Tareas</h1>
        <button (click)="logout()">Cerrar Sesión</button>
      </header>

      <!-- Stats Section -->
      <div *ngIf="stats" class="stats-section">
        <h2>Resumen de Tareas</h2>
        <div class="stats-grid">
          <div class="stat-card total">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-card pending">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
          <div class="stat-card in-progress">
            <span class="stat-value">{{ stats.inProgress }}</span>
            <span class="stat-label">En Progreso</span>
          </div>
          <div class="stat-card completed">
            <span class="stat-value">{{ stats.completed }}</span>
            <span class="stat-label">Completadas</span>
          </div>
          <div class="stat-card cancelled">
            <span class="stat-value">{{ stats.cancelled }}</span>
            <span class="stat-label">Canceladas</span>
          </div>
          <div class="stat-card overdue">
            <span class="stat-value">{{ stats.overdue }}</span>
            <span class="stat-label">Vencidas</span>
          </div>
        </div>
        <div class="completion-rate">
          <span>Tasa de Completado: {{ stats.completionRate }}%</span>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="stats.completionRate"></div>
          </div>
        </div>
      </div>

      <div *ngIf="loading">Cargando...</div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="tasks-list">
        <div
          *ngFor="let task of tasks"
          class="task-card"
          [class.completed]="task.status === 'COMPLETED'"
        >
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <span class="status">{{ task.status }}</span>
        </div>

        <div *ngIf="tasks.length === 0 && !loading" class="no-tasks">No hay tareas. ¡Crea una!</div>
      </div>
    </div>
  `,
  styles: [
    `
      .tasks-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }
      header h1 {
        color: #333;
        margin: 0;
      }
      header button {
        padding: 0.5rem 1rem;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .stats-section {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        margin-bottom: 2rem;
      }
      .stats-section h2 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.25rem;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .stat-card {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .stat-card .stat-value {
        display: block;
        font-size: 2rem;
        font-weight: bold;
        color: #333;
      }
      .stat-card .stat-label {
        display: block;
        font-size: 0.875rem;
        color: #666;
        margin-top: 0.25rem;
      }
      .stat-card.total {
        border-left: 4px solid #667eea;
      }
      .stat-card.pending {
        border-left: 4px solid #f39c12;
      }
      .stat-card.in-progress {
        border-left: 4px solid #3498db;
      }
      .stat-card.completed {
        border-left: 4px solid #27ae60;
      }
      .stat-card.cancelled {
        border-left: 4px solid #95a5a6;
      }
      .stat-card.overdue {
        border-left: 4px solid #e74c3c;
      }
      .completion-rate {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .completion-rate span {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
      }
      .progress-bar {
        height: 20px;
        background: #e9ecef;
        border-radius: 10px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transition: width 0.3s ease;
      }
      .task-card {
        border: 1px solid #ddd;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
      }
      .task-card.completed {
        background: #f0f8f0;
      }
      .status {
        background: #667eea;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }
      .error {
        color: red;
        padding: 1rem;
        background: #fee;
        border-radius: 8px;
      }
    `,
  ],
})
export class TasksComponent implements OnInit {
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);

  tasks: Task[] = [];
  stats: TaskStats | null = null;
  loading = false;
  error = '';

  ngOnInit() {
    this.loadTasks();
    this.loadStats();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar tareas: ' + (err.error?.message || err.message);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadStats() {
    this.taskService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al cargar estadísticas:', err);
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
}
