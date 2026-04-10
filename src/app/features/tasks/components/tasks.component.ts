import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  dueDate: string;
  completedAt: string | null;
}

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
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
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
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  tasks: Task[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    console.log('TasksComponent initialized');
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    console.log('Cargando tareas...');
    this.http.get<Task[]>('http://localhost:9090/api/tasks').subscribe({
      next: (data) => {
        console.log('Tareas recibidas:', data);
        this.tasks = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al cargar tareas:', err);
        this.error = 'Error al cargar tareas: ' + (err.error?.message || err.message);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
}
