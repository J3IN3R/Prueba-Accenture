import { Injectable } from '@angular/core';
import {
  RemoteConfig,
  fetchAndActivate,
  getValue,
  getBoolean,
} from '@angular/fire/remote-config';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Feature flag demo: "enable_task_sorting".
 * Cuando está en true (vía Firebase Remote Config), la lista de tareas
 * se ordena mostrando primero las categorías; cuando está en false,
 * se muestra el orden simple de creación (comportamiento original).
 *
 * Esto permite activar/desactivar la funcionalidad de agrupación por
 * categoría sin publicar una nueva versión de la app.
 */
const FLAG_ENABLE_TASK_SORTING = 'enable_task_sorting';

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private enableTaskSortingSubject = new BehaviorSubject<boolean>(false);
  readonly enableTaskSorting$: Observable<boolean> =
    this.enableTaskSortingSubject.asObservable();

  constructor(private remoteConfig: RemoteConfig) {
    // Valores por defecto mientras se resuelve el fetch remoto.
    this.remoteConfig.defaultConfig = {
      [FLAG_ENABLE_TASK_SORTING]: false,
    };
    // En desarrollo conviene un intervalo corto; en producción usar el
    // valor por defecto (12h) para no gastar cuota de red.
    this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

    this.init();
  }

  private async init(): Promise<void> {
    try {
      await fetchAndActivate(this.remoteConfig);
    } catch (err) {
      // Si falla el fetch (sin red, primera instalación, etc.) se sigue
      // usando el defaultConfig definido arriba, la app no se rompe.
      console.warn('Remote Config fetch falló, usando valores por defecto', err);
    }
    const value = getBoolean(this.remoteConfig, FLAG_ENABLE_TASK_SORTING);
    this.enableTaskSortingSubject.next(value);
  }

  getRawValue(key: string) {
    return getValue(this.remoteConfig, key);
  }
}
