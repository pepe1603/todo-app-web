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
      <header class="app-header">
        <div class="header-left">
          <h1>📋 Mis Tareas</h1>
        </div>
        <button (click)="logout()" class="btn-logout"><span>🚪</span> Cerrar Sesión</button>
      </header>

      <div *ngIf="stats" class="stats-section">
        <div class="stats-header">
          <h2>📊 Resumen de Tareas</h2>
          <span class="completion-badge">{{ stats.completionRate }}% completado</span>
        </div>
        <div class="stats-grid">
          <div class="stat-card total">
            <span class="stat-icon">📁</span>
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-card pending">
            <span class="stat-icon">⏳</span>
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
          <div class="stat-card in-progress">
            <span class="stat-icon">🔄</span>
            <span class="stat-value">{{ stats.inProgress }}</span>
            <span class="stat-label">En Progreso</span>
          </div>
          <div class="stat-card completed">
            <span class="stat-icon">✅</span>
            <span class="stat-value">{{ stats.completed }}</span>
            <span class="stat-label">Completadas</span>
          </div>
          <div class="stat-card cancelled">
            <span class="stat-icon">❌</span>
            <span class="stat-value">{{ stats.cancelled }}</span>
            <span class="stat-label">Canceladas</span>
          </div>
          <div class="stat-card overdue" *ngIf="stats.overdue > 0">
            <span class="stat-icon">⚠️</span>
            <span class="stat-value">{{ stats.overdue }}</span>
            <span class="stat-label">Vencidas</span>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="stats.completionRate"></div>
          </div>
        </div>
      </div>

      <div class="controls-section">
        <div class="filters-section">
          <span class="filter-label">🔍 Filtrar:</span>
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
        <button *ngIf="!showCreateForm" (click)="showCreateForm = true" class="btn-create">
          ➕ Nueva Tarea
        </button>
      </div>

      <div *ngIf="showCreateForm" class="form-card create-form">
        <div class="form-header">
          <h3>✨ Crear Nueva Tarea</h3>
          <button (click)="cancelCreate()" class="btn-close">✕</button>
        </div>
        <form (ngSubmit)="createTask()">
          <div class="form-row">
            <div class="form-group">
              <label for="title">📝 Título</label>
              <input
                type="text"
                id="title"
                [(ngModel)]="newTask.title"
                name="title"
                required
                placeholder="¿Qué necesitas hacer?"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="description">📋 Descripción</label>
              <textarea
                id="description"
                [(ngModel)]="newTask.description"
                name="description"
                placeholder="Agrega más detalles..."
                rows="2"
                class="form-input"
              ></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="dueDate">📅 Fecha límite</label>
              <input
                type="datetime-local"
                id="dueDate"
                [(ngModel)]="newTask.dueDate"
                name="dueDate"
                class="form-input"
              />
            </div>
          </div>
          <div *ngIf="createError" class="form-error">{{ createError }}</div>
          <div class="form-actions">
            <button type="submit" [disabled]="creating" class="btn-primary">
              {{ creating ? '⏳ Creando...' : '✅ Crear Tarea' }}
            </button>
            <button type="button" (click)="cancelCreate()" class="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando tus tareas...</p>
      </div>

      <div *ngIf="error" class="error-banner">{{ error }}</div>

      <div class="tasks-list">
        <div
          *ngFor="let task of filteredTasks"
          class="task-card"
          [class.completed]="task.status === 'COMPLETED'"
          [class.cancelled]="task.status === 'CANCELLED'"
        >
          <div *ngIf="editingTaskId === task.id" class="edit-form">
            <div class="form-header">
              <h3>✏️ Editar Tarea</h3>
              <button (click)="cancelEdit()" class="btn-close">✕</button>
            </div>
            <div class="form-group">
              <label>📝 Título</label>
              <input type="text" [(ngModel)]="editTask.title" class="form-input" />
            </div>
            <div class="form-group">
              <label>📋 Descripción</label>
              <textarea [(ngModel)]="editTask.description" rows="2" class="form-input"></textarea>
            </div>
            <div class="form-group">
              <label>📅 Fecha límite</label>
              <input type="datetime-local" [(ngModel)]="editTask.dueDate" class="form-input" />
            </div>
            <div *ngIf="editError" class="form-error">{{ editError }}</div>
            <div class="form-actions">
              <button (click)="saveEdit(task.id)" [disabled]="saving" class="btn-primary">
                {{ saving ? '⏳' : '✅' }} Guardar
              </button>
              <button (click)="cancelEdit()" class="btn-secondary">Cancelar</button>
            </div>
          </div>

          <div *ngIf="editingTaskId !== task.id" class="task-content">
            <div class="task-header">
              <div class="task-title-section">
                <span class="status-badge" [class]="'status-' + task.status.toLowerCase()">{{
                  getStatusLabel(task.status)
                }}</span>
                <h3 class="task-title">{{ task.title }}</h3>
              </div>
              <div class="task-actions-header">
                <button (click)="startEdit(task)" class="btn-icon" title="Editar">✏️</button>
              </div>
            </div>

            <p *ngIf="task.description" class="task-description">{{ task.description }}</p>

            <div class="task-meta">
              <span *ngIf="task.dueDate" class="meta-item" [class.overdue]="isOverdue(task)">
                📅 {{ formatDate(task.dueDate) }}
                <span *ngIf="isOverdue(task)" class="overdue-badge">Vencida</span>
                <span *ngIf="!isOverdue(task) && getDaysRemaining(task) > 0" class="days-badge"
                  >{{ getDaysRemaining(task) }} días</span
                >
              </span>
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
              <button
                (click)="confirmDelete(task.id, task.title)"
                class="btn-action btn-delete"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>

            <button (click)="toggleDetails(task.id)" class="btn-details">
              {{ expandedTaskId === task.id ? '▲ Ocultar detalles' : '▼ Ver más detalles' }}
            </button>

            <div *ngIf="expandedTaskId === task.id" class="task-details">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">📅 Creado</span>
                  <span class="detail-value">{{ formatDate(task.createdAt) }}</span>
                </div>
                <div *ngIf="task.completedAt" class="detail-item">
                  <span class="detail-label">✅ Completado</span>
                  <span class="detail-value">{{ formatDate(task.completedAt) }}</span>
                </div>
                <div *ngIf="task.dueDate" class="detail-item">
                  <span class="detail-label">⏰ Fecha límite</span>
                  <span class="detail-value" [class.overdue]="isOverdue(task)">{{
                    formatDate(task.dueDate)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">📊 Estado</span>
                  <span class="detail-value">{{ getStatusLabel(task.status) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredTasks.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No hay tareas</h3>
          <p>¡Crea una nueva tarea para comenzar!</p>
        </div>
      </div>

      <div *ngIf="showDeleteConfirm" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-icon">🗑️</div>
          <h3>Confirmar eliminación</h3>
          <p>
            ¿Estás seguro de eliminar "<strong>{{ deleteTaskTitle }}</strong
            >"?
          </p>
          <p class="warning">⚠️ Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button (click)="deleteTask()" class="btn-danger">Eliminar</button>
            <button (click)="cancelDelete()" class="btn-cancel-modal">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --primary: #667eea;
        --primary-dark: #5568d3;
        --secondary: #764ba2;
        --success: #27ae60;
        --warning: #f39c12;
        --danger: #e74c3c;
        --info: #3498db;
        --grey: #95a5a6;
        --dark: #2c3e50;
        --light: #ecf0f1;
        --bg: #f5f7fa;
        --card-bg: #ffffff;
        display: block;
      }
      .tasks-container {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
        background: var(--bg);
        min-height: 100vh;
      }
      .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        padding: 1.25rem 1.5rem;
        border-radius: 12px;
        color: white;
      }
      .app-header h1 {
        margin: 0;
        font-size: 1.5rem;
      }
      .btn-logout {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-logout:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .stats-section {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .stats-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      .stats-header h2 {
        margin: 0;
        color: var(--dark);
        font-size: 1.1rem;
      }
      .completion-badge {
        background: linear-gradient(135deg, var(--success) 0%, #2ecc71 100%);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .stat-card {
        background: var(--bg);
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        transition: transform 0.2s;
      }
      .stat-card:hover {
        transform: translateY(-2px);
      }
      .stat-card .stat-icon {
        display: block;
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
      }
      .stat-card .stat-value {
        display: block;
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--dark);
      }
      .stat-card .stat-label {
        display: block;
        font-size: 0.75rem;
        color: var(--grey);
        margin-top: 0.25rem;
      }
      .stat-card.total {
        border-left: 3px solid var(--primary);
      }
      .stat-card.pending {
        border-left: 3px solid var(--warning);
      }
      .stat-card.in-progress {
        border-left: 3px solid var(--info);
      }
      .stat-card.completed {
        border-left: 3px solid var(--success);
      }
      .stat-card.cancelled {
        border-left: 3px solid var(--grey);
      }
      .stat-card.overdue {
        border-left: 3px solid var(--danger);
      }
      .progress-container {
        margin-top: 0.5rem;
      }
      .progress-bar {
        height: 8px;
        background: var(--light);
        border-radius: 4px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
        border-radius: 4px;
        transition: width 0.5s ease;
      }
      .controls-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .filters-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .filter-label {
        font-weight: 500;
        color: var(--dark);
      }
      .filter-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .filter-btn {
        padding: 0.4rem 0.8rem;
        background: var(--card-bg);
        border: 1px solid #e0e0e0;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.8rem;
        color: var(--grey);
        transition: all 0.2s;
      }
      .filter-btn:hover {
        border-color: var(--primary);
        color: var(--primary);
      }
      .filter-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
      .btn-create {
        background: linear-gradient(135deg, var(--success) 0%, #2ecc71 100%);
        color: white;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
      }
      .btn-create:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
      }
      .form-card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        animation: slideDown 0.3s ease;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      .form-header h3 {
        margin: 0;
        color: var(--dark);
      }
      .btn-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: var(--grey);
      }
      .form-row {
        margin-bottom: 1rem;
      }
      .form-group {
        margin-bottom: 0.75rem;
      }
      .form-group label {
        display: block;
        margin-bottom: 0.35rem;
        color: var(--dark);
        font-weight: 500;
        font-size: 0.9rem;
      }
      .form-input {
        width: 100%;
        padding: 0.6rem 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.95rem;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      .form-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
      .form-error {
        color: var(--danger);
        font-size: 0.85rem;
        margin-top: 0.5rem;
      }
      .form-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .btn-primary {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: white;
        border: none;
        padding: 0.6rem 1.25rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-secondary {
        background: var(--light);
        color: var(--dark);
        border: 1px solid #d0d0d0;
        padding: 0.6rem 1.25rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-secondary:hover {
        background: #dfe4ea;
      }
      .loading-state {
        text-align: center;
        padding: 3rem;
        color: var(--grey);
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--light);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .error-banner {
        background: #fee;
        color: var(--danger);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border-left: 4px solid var(--danger);
      }
      .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .task-card {
        background: var(--card-bg);
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.2s;
        border-left: 4px solid var(--primary);
      }
      .task-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }
      .task-card.completed {
        border-left-color: var(--success);
        opacity: 0.85;
      }
      .task-card.cancelled {
        border-left-color: var(--grey);
        opacity: 0.7;
      }
      .task-content {
        animation: fadeIn 0.3s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }
      .task-title-section {
        flex: 1;
      }
      .status-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 0.35rem;
      }
      .status-pending {
        background: #fef5e7;
        color: var(--warning);
      }
      .status-in_progress {
        background: #ebf5fb;
        color: var(--info);
      }
      .status-completed {
        background: #e8f8f0;
        color: var(--success);
      }
      .status-cancelled {
        background: #f4f4f4;
        color: var(--grey);
      }
      .task-title {
        margin: 0;
        color: var(--dark);
        font-size: 1.1rem;
      }
      .task-actions-header {
        display: flex;
        gap: 0.5rem;
      }
      .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        padding: 0.25rem;
        opacity: 0.6;
        transition: opacity 0.2s;
      }
      .btn-icon:hover {
        opacity: 1;
      }
      .task-description {
        color: #666;
        margin: 0 0 0.75rem 0;
        font-size: 0.95rem;
        line-height: 1.5;
      }
      .task-meta {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
      }
      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #888;
        font-size: 0.85rem;
      }
      .meta-item.overdue {
        color: var(--danger);
      }
      .overdue-badge {
        background: var(--danger);
        color: white;
        padding: 0.1rem 0.4rem;
        border-radius: 10px;
        font-size: 0.7rem;
      }
      .days-badge {
        background: var(--success);
        color: white;
        padding: 0.1rem 0.4rem;
        border-radius: 10px;
        font-size: 0.7rem;
      }
      .task-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
      }
      .btn-action {
        padding: 0.35rem 0.75rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        color: white;
        transition: all 0.2s;
      }
      .btn-action:hover {
        opacity: 0.9;
        transform: scale(1.02);
      }
      .btn-start {
        background: var(--info);
      }
      .btn-complete {
        background: var(--success);
      }
      .btn-cancel-action {
        background: var(--grey);
      }
      .btn-reopen {
        background: var(--warning);
      }
      .btn-delete {
        background: var(--danger);
        margin-left: auto;
      }
      .btn-details {
        background: none;
        border: none;
        color: var(--primary);
        cursor: pointer;
        font-size: 0.8rem;
        text-decoration: underline;
        padding: 0;
      }
      .task-details {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 0.75rem;
        animation: slideDown 0.3s ease;
      }
      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.75rem;
      }
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .detail-label {
        font-size: 0.75rem;
        color: var(--grey);
      }
      .detail-value {
        font-size: 0.9rem;
        color: var(--dark);
        font-weight: 500;
      }
      .detail-value.overdue {
        color: var(--danger);
      }
      .edit-form {
        animation: slideDown 0.3s ease;
      }
      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--grey);
      }
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      .empty-state h3 {
        color: var(--dark);
        margin: 0 0 0.5rem 0;
      }
      .empty-state p {
        margin: 0;
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
        backdrop-filter: blur(4px);
      }
      .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: scaleIn 0.3s ease;
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .modal-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      .modal-content h3 {
        margin: 0 0 0.75rem 0;
        color: var(--dark);
      }
      .modal-content p {
        color: #666;
        margin: 0 0 0.5rem 0;
      }
      .modal-content .warning {
        color: var(--danger);
        font-size: 0.85rem;
      }
      .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        justify-content: center;
      }
      .btn-danger {
        background: var(--danger);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
      }
      .btn-cancel-modal {
        background: var(--light);
        color: var(--dark);
        border: 1px solid #d0d0d0;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
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
        if (index !== -1) this.tasks[index] = updatedTask;
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
        if (index !== -1) this.tasks[index] = updatedTask;
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
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
    this.filteredTasks =
      this.statusFilter === 'ALL'
        ? [...this.tasks]
        : this.tasks.filter((t) => t.status === this.statusFilter);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] || status;
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
