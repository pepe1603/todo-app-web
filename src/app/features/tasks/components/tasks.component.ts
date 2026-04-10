import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TaskService,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../../../core/services/task.service';
import { TaskStats } from '../models/task-stats';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tasks-container">
      <header>
        <h1>Mis Tareas</h1>
        <button (click)="logout()">Cerrar Sesión</button>
      </header>

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

      <!-- Filters -->
      <div class="filters-section">
        <span class="filter-label">Filtrar por:</span>
        <div class="filter-buttons">
          <button
            type="button"
            (click)="filterByStatus('ALL')"
            [class.active]="statusFilter === 'ALL'"
            class="filter-btn"
          >
            Todas
          </button>
          <button
            type="button"
            (click)="filterByStatus('PENDING')"
            [class.active]="statusFilter === 'PENDING'"
            class="filter-btn"
          >
            Pendientes
          </button>
          <button
            type="button"
            (click)="filterByStatus('IN_PROGRESS')"
            [class.active]="statusFilter === 'IN_PROGRESS'"
            class="filter-btn"
          >
            En Progreso
          </button>
          <button
            type="button"
            (click)="filterByStatus('COMPLETED')"
            [class.active]="statusFilter === 'COMPLETED'"
            class="filter-btn"
          >
            Completadas
          </button>
          <button
            type="button"
            (click)="filterByStatus('CANCELLED')"
            [class.active]="statusFilter === 'CANCELLED'"
            class="filter-btn"
          >
            Canceladas
          </button>
        </div>
      </div>

      <div class="create-task-section">
        <button *ngIf="!showCreateForm" (click)="showCreateForm = true" class="btn-create">
          + Nueva Tarea
        </button>
      </div>

      <div *ngIf="showCreateForm" class="create-form">
        <h3>Crear Nueva Tarea</h3>
        <form (ngSubmit)="createTask()">
          <div class="form-group">
            <label for="title">Título</label>
            <input
              type="text"
              id="title"
              [(ngModel)]="newTask.title"
              name="title"
              required
              placeholder="Título de la tarea"
            />
          </div>
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              [(ngModel)]="newTask.description"
              name="description"
              placeholder="Descripción de la tarea"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="dueDate">Fecha límite</label>
            <input
              type="datetime-local"
              id="dueDate"
              [(ngModel)]="newTask.dueDate"
              name="dueDate"
            />
          </div>
          <div class="form-actions">
            <button type="submit" [disabled]="creating" class="btn-submit">
              {{ creating ? 'Creando...' : 'Crear Tarea' }}
            </button>
            <button type="button" (click)="cancelCreate()" class="btn-cancel">Cancelar</button>
          </div>
          <div *ngIf="createError" class="error">{{ createError }}</div>
        </form>
      </div>

      <div *ngIf="loading">Cargando...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="showDeleteConfirm" class="modal-overlay">
        <div class="modal-content">
          <h3>Confirmar eliminación</h3>
          <p>
            ¿Estás seguro de que deseas eliminar la tarea "<strong>{{ deleteTaskTitle }}</strong
            >"?
          </p>
          <p class="warning">Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button (click)="deleteTask()" class="btn-danger">Eliminar</button>
            <button (click)="cancelDelete()" class="btn-cancel-modal">Cancelar</button>
          </div>
        </div>
      </div>

      <div class="tasks-list">
        <div
          *ngFor="let task of filteredTasks"
          class="task-card"
          [class.completed]="task.status === 'COMPLETED'"
        >
          <!-- Edit Form -->
          <div *ngIf="editingTaskId === task.id" class="edit-form">
            <h3>Editar Tarea</h3>
            <div class="form-group">
              <label for="editTitle">Título</label>
              <input type="text" id="editTitle" [(ngModel)]="editTask.title" name="editTitle" />
            </div>
            <div class="form-group">
              <label for="editDescription">Descripción</label>
              <textarea
                id="editDescription"
                [(ngModel)]="editTask.description"
                name="editDescription"
                rows="2"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="editDueDate">Fecha límite</label>
              <input
                type="datetime-local"
                id="editDueDate"
                [(ngModel)]="editTask.dueDate"
                name="editDueDate"
              />
            </div>
            <div class="form-actions">
              <button (click)="saveEdit(task.id)" [disabled]="saving" class="btn-submit">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
              <button (click)="cancelEdit()" class="btn-cancel">Cancelar</button>
            </div>
            <div *ngIf="editError" class="error">{{ editError }}</div>
          </div>

          <!-- Task Display -->
          <div *ngIf="editingTaskId !== task.id">
            <div class="task-header">
              <h3>{{ task.title }}</h3>
              <button (click)="startEdit(task)" class="btn-edit">Editar</button>
            </div>
            <p>{{ task.description }}</p>
            <div class="task-meta">
              <span class="status" [class]="'status-' + task.status.toLowerCase()">{{
                task.status
              }}</span>
              <span *ngIf="task.dueDate" class="due-date">📅 {{ formatDate(task.dueDate) }}</span>
              <button (click)="toggleDetails(task.id)" class="btn-details">
                {{ expandedTaskId === task.id ? '▲ Ocultar' : '▼ Ver más' }}
              </button>
            </div>

            <!-- Accordion Details -->
            <div *ngIf="expandedTaskId === task.id" class="task-details">
              <div class="detail-row">
                <span class="detail-label">Creado:</span>
                <span class="detail-value">{{ formatDate(task.createdAt) }}</span>
              </div>
              <div *ngIf="task.completedAt" class="detail-row">
                <span class="detail-label">Completado:</span>
                <span class="detail-value">{{ formatDate(task.completedAt) }}</span>
              </div>
              <div *ngIf="task.dueDate" class="detail-row">
                <span class="detail-label">Fecha límite:</span>
                <span class="detail-value">{{ formatDate(task.dueDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Días restantes:</span>
                <span
                  class="detail-value"
                  [class.overdue]="isOverdue(task)"
                  [class.remaining]="!isOverdue(task) && getDaysRemaining(task) > 0"
                >
                  <span *ngIf="isOverdue(task)">⚠️ Vencida ({{ getDaysOverdue(task) }} días)</span>
                  <span *ngIf="!isOverdue(task) && getDaysRemaining(task) > 0"
                    >✓ {{ getDaysRemaining(task) }} días</span
                  >
                  <span *ngIf="!isOverdue(task) && getDaysRemaining(task) === 0">Hoy</span>
                  <span *ngIf="task.status === 'COMPLETED'">-</span>
                </span>
              </div>
            </div>
            <div class="task-actions">
              <button
                *ngIf="task.status === 'PENDING'"
                (click)="changeStatus(task.id, 'IN_PROGRESS')"
                class="btn-action btn-start"
              >
                ▶ Iniciar
              </button>
              <button
                *ngIf="task.status === 'PENDING' || task.status === 'IN_PROGRESS'"
                (click)="changeStatus(task.id, 'COMPLETED')"
                class="btn-action btn-complete"
              >
                ✓ Completar
              </button>
              <button
                *ngIf="task.status === 'PENDING' || task.status === 'IN_PROGRESS'"
                (click)="changeStatus(task.id, 'CANCELLED')"
                class="btn-action btn-cancel-action"
              >
                ✕ Cancelar
              </button>
              <button
                *ngIf="task.status === 'CANCELLED'"
                (click)="changeStatus(task.id, 'PENDING')"
                class="btn-action btn-reopen"
              >
                ↻ Reabrir
              </button>
              <button (click)="confirmDelete(task.id, task.title)" class="btn-action btn-delete">
                🗑 Eliminar
              </button>
            </div>
          </div>
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
      .create-task-section {
        margin-bottom: 1.5rem;
      }
      .filters-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
      .filter-label {
        font-weight: 500;
        color: #333;
      }
      .filter-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .filter-btn {
        padding: 0.5rem 1rem;
        background: white;
        border: 1px solid #ddd;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.875rem;
        color: #666;
        transition: all 0.2s;
      }
      .filter-btn:hover {
        border-color: #667eea;
        color: #667eea;
      }
      .filter-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }
      .btn-create {
        padding: 0.75rem 1.5rem;
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
      }
      .create-form {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
      }
      .create-form h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #555;
        font-weight: 500;
      }
      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        font-family: inherit;
      }
      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #667eea;
      }
      .form-actions {
        display: flex;
        gap: 1rem;
      }
      .btn-submit {
        padding: 0.75rem 1.5rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
      }
      .btn-submit:disabled {
        background: #ccc;
      }
      .btn-cancel {
        padding: 0.75rem 1.5rem;
        background: #95a5a6;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
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
      .status-pending {
        background: #f39c12;
      }
      .status-in_progress {
        background: #3498db;
      }
      .status-completed {
        background: #27ae60;
      }
      .status-cancelled {
        background: #95a5a6;
      }
      .error {
        color: red;
        padding: 0.5rem;
        background: #fee;
        border-radius: 4px;
        margin-top: 0.5rem;
      }
      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .task-header h3 {
        margin: 0;
        color: #333;
      }
      .btn-edit {
        padding: 0.25rem 0.75rem;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .task-meta {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-top: 0.5rem;
      }
      .due-date {
        color: #666;
        font-size: 0.875rem;
      }
      .edit-form {
        background: #fff3cd;
        padding: 1rem;
        border-radius: 8px;
      }
      .edit-form h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }
      .edit-form .form-group {
        margin-bottom: 0.75rem;
      }
      .edit-form .form-group label {
        display: block;
        margin-bottom: 0.25rem;
        color: #555;
        font-weight: 500;
        font-size: 0.875rem;
      }
      .edit-form .form-group input,
      .edit-form .form-group textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
      }
      .task-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
        flex-wrap: wrap;
      }
      .btn-action {
        padding: 0.25rem 0.75rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
        color: white;
      }
      .btn-start {
        background: #3498db;
      }
      .btn-complete {
        background: #27ae60;
      }
      .btn-cancel-action {
        background: #95a5a6;
      }
      .btn-reopen {
        background: #f39c12;
      }
      .btn-delete {
        background: #e74c3c;
        margin-left: auto;
      }
      .btn-action:hover {
        opacity: 0.9;
      }
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .modal-content {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
      }
      .modal-content h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }
      .modal-content p {
        color: #666;
        margin-bottom: 0.5rem;
      }
      .modal-content .warning {
        color: #e74c3c;
        font-size: 0.875rem;
      }
      .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
      }
      .btn-danger {
        padding: 0.75rem 1.5rem;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .btn-cancel-modal {
        padding: 0.75rem 1.5rem;
        background: #95a5a6;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .btn-details {
        background: none;
        border: none;
        color: #667eea;
        cursor: pointer;
        font-size: 0.8rem;
        text-decoration: underline;
        margin-left: auto;
      }
      .task-details {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 0.75rem;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
      }
      .detail-row:last-child {
        border-bottom: none;
      }
      .detail-label {
        color: #666;
        font-weight: 500;
      }
      .detail-value {
        color: #333;
      }
      .detail-value.overdue {
        color: #e74c3c;
        font-weight: 500;
      }
      .detail-value.remaining {
        color: #27ae60;
        font-weight: 500;
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

  showCreateForm = false;
  creating = false;
  createError = '';
  newTask: CreateTaskRequest = { title: '', description: '', dueDate: '' };

  editingTaskId: number | null = null;
  editTask: UpdateTaskRequest = { title: '', description: '', dueDate: '' };
  saving = false;
  editError = '';

  expandedTaskId: number | null = null;

  showDeleteConfirm = false;
  deleteTaskId: number | null = null;
  deleteTaskTitle = '';

  statusFilter: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' = 'ALL';
  filteredTasks: Task[] = [];

  ngOnInit() {
    this.loadTasks();
    this.loadStats();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.applyFilter();
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

  createTask() {
    if (!this.newTask.title.trim()) {
      this.createError = 'El título es requerido';
      this.cdr.detectChanges();
      return;
    }

    this.creating = true;
    this.createError = '';

    this.taskService.createTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks.unshift(task);
        this.applyFilter();
        this.creating = false;
        this.showCreateForm = false;
        this.newTask = { title: '', description: '', dueDate: '' };
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.creating = false;
        this.createError = 'Error al crear tarea: ' + (err.error?.message || err.message);
        this.cdr.detectChanges();
      },
    });
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.newTask = { title: '', description: '', dueDate: '' };
    this.createError = '';
  }

  startEdit(task: Task) {
    this.editingTaskId = task.id;
    this.editTask = {
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
    };
    this.editError = '';
  }

  saveEdit(taskId: number) {
    if (!this.editTask.title?.trim()) {
      this.editError = 'El título es requerido';
      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.editError = '';

    this.taskService.updateTask(taskId, this.editTask).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.applyFilter();
        this.saving = false;
        this.editingTaskId = null;
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.editError = 'Error al guardar: ' + (err.error?.message || err.message);
        this.cdr.detectChanges();
      },
    });
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.editTask = { title: '', description: '', dueDate: '' };
    this.editError = '';
  }

  changeStatus(taskId: number, status: string) {
    this.taskService.changeStatus(taskId, status).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.applyFilter();
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cambiar estado: ' + (err.error?.message || err.message);
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(taskId: number, title: string) {
    this.deleteTaskId = taskId;
    this.deleteTaskTitle = title;
    this.showDeleteConfirm = true;
  }

  deleteTask() {
    if (!this.deleteTaskId) return;

    this.taskService.deleteTask(this.deleteTaskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== this.deleteTaskId);
        this.applyFilter();
        this.showDeleteConfirm = false;
        this.deleteTaskId = null;
        this.deleteTaskTitle = '';
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al eliminar: ' + (err.error?.message || err.message);
        this.showDeleteConfirm = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.deleteTaskId = null;
    this.deleteTaskTitle = '';
  }

  toggleDetails(taskId: number) {
    this.expandedTaskId = this.expandedTaskId === taskId ? null : taskId;
  }

  getDaysRemaining(task: Task): number {
    if (!task.dueDate || task.status === 'COMPLETED') return 0;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'COMPLETED') return false;
    return this.getDaysRemaining(task) < 0;
  }

  getDaysOverdue(task: Task): number {
    return Math.abs(this.getDaysRemaining(task));
  }

  filterByStatus(status: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
    this.statusFilter = status;
    this.applyFilter();
  }

  applyFilter() {
    if (this.statusFilter === 'ALL') {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter((t) => t.status === this.statusFilter);
    }
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('es-ES', options);
  }
}
