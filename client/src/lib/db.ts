import { GroceryList } from './api';

const DB_NAME = 'ShopListDB';
const DB_VERSION = 1;
const LISTS_STORE = 'lists';
const SHARED_LISTS_STORE = 'sharedLists';

class LocalDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB: Ошибка открытия базы данных');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB: База данных открыта');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Хранилище для личных списков пользователя
        if (!db.objectStoreNames.contains(LISTS_STORE)) {
          const listsStore = db.createObjectStore(LISTS_STORE, { keyPath: 'id' });
          listsStore.createIndex('userId', 'userId', { unique: false });
          listsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          console.log('IndexedDB: Создано хранилище списков');
        }

        // Хранилище для публичных (shared) списков
        if (!db.objectStoreNames.contains(SHARED_LISTS_STORE)) {
          const sharedStore = db.createObjectStore(SHARED_LISTS_STORE, { keyPath: 'id' });
          sharedStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          console.log('IndexedDB: Создано хранилище публичных списков');
        }
      };
    });
  }

  // Сохранить списки пользователя
  async saveLists(lists: GroceryList[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LISTS_STORE], 'readwrite');
      const store = transaction.objectStore(LISTS_STORE);

      // Сначала очищаем старые данные
      store.clear();

      // Сохраняем каждый список
      lists.forEach((list) => {
        store.put(list);
      });

      transaction.oncomplete = () => {
        console.log(`IndexedDB: Сохранено ${lists.length} списков`);
        resolve();
      };

      transaction.onerror = () => {
        console.error('IndexedDB: Ошибка сохранения списков');
        reject(transaction.error);
      };
    });
  }

  // Получить все списки пользователя из кэша
  async getLists(): Promise<GroceryList[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LISTS_STORE], 'readonly');
      const store = transaction.objectStore(LISTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const lists = request.result || [];
        console.log(`IndexedDB: Получено ${lists.length} списков из кэша`);
        resolve(lists);
      };

      request.onerror = () => {
        console.error('IndexedDB: Ошибка получения списков');
        reject(request.error);
      };
    });
  }

  // Сохранить один список
  async saveList(list: GroceryList): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LISTS_STORE], 'readwrite');
      const store = transaction.objectStore(LISTS_STORE);
      const request = store.put(list);

      request.onsuccess = () => {
        console.log(`IndexedDB: Список "${list.name}" сохранен`);
        resolve();
      };

      request.onerror = () => {
        console.error('IndexedDB: Ошибка сохранения списка');
        reject(request.error);
      };
    });
  }

  // Получить один список из кэша
  async getList(id: string): Promise<GroceryList | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LISTS_STORE], 'readonly');
      const store = transaction.objectStore(LISTS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const list = request.result || null;
        if (list) {
          console.log(`IndexedDB: Список "${list.name}" получен из кэша`);
        } else {
          console.log(`IndexedDB: Список ${id} не найден в кэше`);
        }
        resolve(list);
      };

      request.onerror = () => {
        console.error('IndexedDB: Ошибка получения списка');
        reject(request.error);
      };
    });
  }

  // Удалить список из кэша
  async deleteList(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LISTS_STORE], 'readwrite');
      const store = transaction.objectStore(LISTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`IndexedDB: Список ${id} удален из кэша`);
        resolve();
      };

      request.onerror = () => {
        console.error('IndexedDB: Ошибка удаления списка');
        reject(request.error);
      };
    });
  }

  // Сохранить публичный (shared) список
  async saveSharedList(list: GroceryList): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SHARED_LISTS_STORE], 'readwrite');
      const store = transaction.objectStore(SHARED_LISTS_STORE);
      
      // Добавляем время кэширования
      const cachedList = {
        ...list,
        cachedAt: new Date().toISOString()
      };
      
      const request = store.put(cachedList);

      request.onsuccess = () => {
        console.log(`IndexedDB: Публичный список "${list.name}" сохранен`);
        resolve();
      };

      request.onerror = () => {
        console.error('IndexedDB: Ошибка сохранения публичного списка');
        reject(request.error);
      };
    });
  }

  // Получить публичный список из кэша
  async getSharedList(id: string): Promise<GroceryList | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([SHARED_LISTS_STORE], 'readonly');
      const store = transaction.objectStore(SHARED_LISTS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const list = request.result || null;
        if (list) {
          console.log(`IndexedDB: Публичный список "${list.name}" получен из кэша`);
        }
        resolve(list);
      };

      request.onerror = () => {
        console.error('IndexedDB: Ошибка получения публичного списка');
        reject(request.error);
      };
    });
  }

  // Очистить все данные
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([LISTS_STORE, SHARED_LISTS_STORE], 'readwrite');
      
      transaction.objectStore(LISTS_STORE).clear();
      transaction.objectStore(SHARED_LISTS_STORE).clear();

      transaction.oncomplete = () => {
        console.log('IndexedDB: Все данные очищены');
        resolve();
      };

      transaction.onerror = () => {
        console.error('IndexedDB: Ошибка очистки данных');
        reject(transaction.error);
      };
    });
  }
}

// Экспортируем единственный экземпляр
export const localDB = new LocalDatabase();

