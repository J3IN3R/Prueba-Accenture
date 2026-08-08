import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CategoryService } from '../services/category.service';
import { TaskService } from '../services/task.service';
import { Category } from '../models/category.model';

const DEFAULT_COLORS = ['#3880ff', '#2dd36f', '#ffc409', '#eb445a', '#92949c'];

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  categories$ = this.categoryService.categories$;
  newCategoryName = '';

  constructor(
    private categoryService: CategoryService,
    private taskService: TaskService,
    private alertController: AlertController
  ) {}

  addCategory(): void {
    if (!this.newCategoryName.trim()) return;
    const color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
    this.categoryService.addCategory(this.newCategoryName, color);
    this.newCategoryName = '';
  }

  async editCategory(category: Category): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Editar categoría',
      inputs: [{ name: 'name', type: 'text', value: category.name }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.name?.trim()) {
              this.categoryService.updateCategory(category.id, { name: data.name.trim() });
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteCategory(category: Category): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar categoría',
      message: `Las tareas de "${category.name}" quedarán sin categoría. ¿Continuar?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.categoryService.deleteCategory(category.id);
            this.taskService.clearCategoryFromTasks(category.id);
          },
        },
      ],
    });
    await alert.present();
  }
}
