import { Pipe, PipeTransform } from '@angular/core';
import { Category } from '../models/category.model';

/**
 * Pipe PURO (por defecto en Angular): Angular memoiza el resultado y solo
 * lo vuelve a ejecutar si `categories` cambia de referencia (nueva emisión
 * del Observable) o si `categoryId` cambia. A diferencia de un método
 * llamado directamente en el template, esto NO se recalcula en cada ciclo
 * de change detection, solo cuando realmente hay un cambio relevante.
 */
@Pipe({ name: 'categoryLookup' })
export class CategoryLookupPipe implements PipeTransform {
  // Cachea el último array de categorías convertido a Map, así el lookup
  // es O(1) en vez de recorrer el array (O(n)) por cada tarea visible.
  private lastCategories: Category[] | null = null;
  private map = new Map<string, Category>();

  transform(categories: Category[], categoryId: string | null): Category | undefined {
    if (!categoryId) return undefined;
    if (categories !== this.lastCategories) {
      this.map = new Map(categories.map((c) => [c.id, c]));
      this.lastCategories = categories;
    }
    return this.map.get(categoryId);
  }
}
