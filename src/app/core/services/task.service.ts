import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskStats } from '../../features/tasks/models/task-stats';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  dueDate: string;
  completedAt: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:9090/api/tasks';
  private http = inject(HttpClient);

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${this.apiUrl}/stats`);
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changeStatus(id: number, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  startTask(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/start`, {});
  }

  completeTask(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/complete`, {});
  }

  cancelTask(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/cancel`, {});
  }

  reopenTask(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/reopen`, {});
  }
}
