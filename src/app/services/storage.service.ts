import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Envuelve Ionic Storage (IndexedDB/SQLite/WebSQL según plataforma).
 * Se inicializa una sola vez y se reutiliza en toda la app para evitar
 * overhead de I/O repetido.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;
  private ready: Promise<Storage>;

  constructor(private storage: Storage) {
    this.ready = this.init();
  }

  private async init(): Promise<Storage> {
    const storage = await this.storage.create();
    this._storage = storage;
    return storage;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ready;
    return this._storage?.get(key) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.ready;
    await this._storage?.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.ready;
    await this._storage?.remove(key);
  }
}
