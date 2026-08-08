import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { StorageService } from './storage.service';

const TASKS_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private categoryFilterSubject = new BehaviorSubject<string | null>(null);

  readonly tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  readonly categoryFilter$ = this.categoryFilterSubject.asObservable();

  /** Lista ya filtrada por categoría, lista para pintar en la UI. */
  readonly filteredTasks$: Observable<Task[]> = combineLatest([
    this.tasks$,
    this.categoryFilter$,
  ]).pipe(
    map(([tasks, categoryId]) =>
      categoryId ? tasks.filter((t) => t.categoryId === categoryId) : tasks
    )
  );

  constructor(private storageService: StorageService) {
    this.loadTasks();

    // Debounce de escrituras a disco: si el usuario marca varias tareas
    // rápido, se agrupan las escrituras en vez de golpear storage en cada click.
    this.tasksSubject.pipe(debounceTime(300)).subscribe((tasks) => {
      this.storageService.set(TASKS_KEY, tasks);
    });
  }

  private async loadTasks(): Promise<void> {
    const stored = await this.storageService.get<Task[]>(TASKS_KEY);
    this.tasksSubject.next(stored ?? []);
  }

  setCategoryFilter(categoryId: string | null): void {
    this.categoryFilterSubject.next(categoryId);
  }

  addTask(title: string, categoryId: string | null): void {
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      categoryId,
      createdAt: Date.now(),
    };
    this.tasksSubject.next([task, ...this.tasksSubject.value]);
  }

  toggleCompleted(id: string): void {
    const updated = this.tasksSubject.value.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    this.tasksSubject.next(updated);
  }

  deleteTask(id: string): void {
    const updated = this.tasksSubject.value.filter((t) => t.id !== id);
    this.tasksSubject.next(updated);
  }

  /** Reasigna a "sin categoría" cualquier tarea de una categoría eliminada. */
  clearCategoryFromTasks(categoryId: string): void {
    const updated = this.tasksSubject.value.map((t) =>
      t.categoryId === categoryId ? { ...t, categoryId: null } : t
    );
    this.tasksSubject.next(updated);
  }

  trackById(_index: number, task: Task): string {
    return task.id;
  }
}
