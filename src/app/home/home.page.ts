import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { TaskService } from '../services/task.service';
import { CategoryService } from '../services/category.service';
import { RemoteConfigService } from '../services/remote-config.service';
import { Task } from '../models/task.model';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  // OnPush: la vista solo se re-renderiza cuando cambian los observables
  // (async pipe) o los @Input, no en cada ciclo de digest de Angular.
  // Reduce notablemente el trabajo de change detection con listas grandes.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  newTaskTitle = '';
  newTaskCategoryId: string | null = null;

  categories$: Observable<Category[]> = this.categoryService.categories$;
  activeFilter$ = this.taskService.categoryFilter$;
  enableTaskSorting$ = this.remoteConfigService.enableTaskSorting$;

  // Combina tareas filtradas + flag de Remote Config para decidir el orden.
  tasks$: Observable<Task[]> = combineLatest([
    this.taskService.filteredTasks$,
    this.remoteConfigService.enableTaskSorting$,
  ]).pipe(
    map(([tasks, sortByCategory]) => {
      if (!sortByCategory) return tasks;
      return [...tasks].sort((a, b) => {
        const ca = a.categoryId ?? '';
        const cb = b.categoryId ?? '';
        return ca.localeCompare(cb);
      });
    })
  );

  trackById = this.taskService.trackById;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private remoteConfigService: RemoteConfigService,
    private alertController: AlertController
  ) {}

  addTask(): void {
    if (!this.newTaskTitle.trim()) return;
    this.taskService.addTask(this.newTaskTitle, this.newTaskCategoryId);
    this.newTaskTitle = '';
    this.newTaskCategoryId = null;
  }

  toggleCompleted(task: Task): void {
    this.taskService.toggleCompleted(task.id);
  }

  async deleteTask(task: Task): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar tarea',
      message: `¿Eliminar "${task.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.taskService.deleteTask(task.id),
        },
      ],
    });
    await alert.present();
  }

  filterByCategory(categoryId: string | null): void {
    this.taskService.setCategoryFilter(categoryId);
  }
}
