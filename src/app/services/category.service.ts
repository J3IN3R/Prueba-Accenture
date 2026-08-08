import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { StorageService } from './storage.service';

const CATEGORIES_KEY = 'categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  readonly categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    const stored = await this.storageService.get<Category[]>(CATEGORIES_KEY);
    this.categoriesSubject.next(stored ?? []);
  }

  private async persist(categories: Category[]): Promise<void> {
    this.categoriesSubject.next(categories);
    // Escritura asíncrona: no bloquea la UI mientras se guarda.
    await this.storageService.set(CATEGORIES_KEY, categories);
  }

  async addCategory(name: string, color: string): Promise<void> {
    const category: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
    };
    const updated = [...this.categoriesSubject.value, category];
    await this.persist(updated);
  }

  async updateCategory(id: string, changes: Partial<Category>): Promise<void> {
    const updated = this.categoriesSubject.value.map((c) =>
      c.id === id ? { ...c, ...changes } : c
    );
    await this.persist(updated);
  }

  async deleteCategory(id: string): Promise<void> {
    const updated = this.categoriesSubject.value.filter((c) => c.id !== id);
    await this.persist(updated);
  }

  getById(id: string | null): Category | undefined {
    if (!id) return undefined;
    return this.categoriesSubject.value.find((c) => c.id === id);
  }
}
