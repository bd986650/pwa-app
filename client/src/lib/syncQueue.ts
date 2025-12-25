// Очередь отложенных операций для офлайн-режима
import { apiClient } from './api';
import { toast } from 'sonner';

export type PendingOperation = 
  | {
      type: 'CREATE_LIST';
      id: string; // временный локальный ID
      data: {
        name: string;
        description?: string;
        items?: Array<{ name: string; quantity?: number; unit?: string }>;
      };
      timestamp: number;
    }
  | {
      type: 'DELETE_LIST';
      id: string;
      timestamp: number;
    }
  | {
      type: 'UPDATE_LIST';
      id: string;
      data: { name?: string; description?: string };
      timestamp: number;
    }
  | {
      type: 'ADD_ITEM';
      listId: string;
      data: { name: string; quantity?: number; unit?: string };
      timestamp: number;
    }
  | {
      type: 'DELETE_ITEM';
      listId: string;
      itemId: string;
      timestamp: number;
    }
  | {
      type: 'TOGGLE_ITEM';
      listId: string;
      itemId: string;
      timestamp: number;
    }
  | {
      type: 'UPDATE_ITEM';
      listId: string;
      itemId: string;
      data: { name?: string; quantity?: number; unit?: string; completed?: boolean };
      timestamp: number;
    };

const SYNC_QUEUE_KEY = 'pendingOperations';

class SyncQueue {
  // Получить все отложенные операции
  getQueue(): PendingOperation[] {
    const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!queueJson) return [];
    
    try {
      return JSON.parse(queueJson);
    } catch (error) {
      console.error('Ошибка парсинга очереди синхронизации:', error);
      return [];
    }
  }

  // Добавить операцию в очередь
  addToQueue(operation: PendingOperation): void {
    const queue = this.getQueue();
    queue.push(operation);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    console.log('SyncQueue: Операция добавлена в очередь:', operation.type);
  }

  // Очистить очередь
  clearQueue(): void {
    localStorage.removeItem(SYNC_QUEUE_KEY);
    console.log('SyncQueue: Очередь очищена');
  }

  // Проверить есть ли отложенные операции
  hasPendingOperations(): boolean {
    return this.getQueue().length > 0;
  }

  // Получить количество отложенных операций
  getPendingCount(): number {
    return this.getQueue().length;
  }

  // Синхронизировать все отложенные операции с сервером
  async syncAll(): Promise<{ success: number; failed: number; errors: Array<{ operation: PendingOperation; error: string }> }> {
    const queue = this.getQueue();
    
    if (queue.length === 0) {
      console.log('SyncQueue: Нет операций для синхронизации');
      return { success: 0, failed: 0, errors: [] };
    }

    console.log(`SyncQueue: Начало синхронизации ${queue.length} операций...`);
    
    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ operation: PendingOperation; error: string }> = [];
    const newQueue: PendingOperation[] = [];

    // Сортируем операции по timestamp (старые первыми)
    const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);

    for (const operation of sortedQueue) {
      try {
        await this.executeOperation(operation);
        successCount++;
        console.log(`SyncQueue: Успешно выполнена операция ${operation.type}`);
      } catch (error) {
        failedCount++;
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        console.error(`SyncQueue: Ошибка при выполнении операции ${operation.type}:`, errorMessage);
        errors.push({ operation, error: errorMessage });
        
        // Оставляем неудачные операции в очереди для повторной попытки
        newQueue.push(operation);
      }
    }

    // Обновляем очередь (оставляем только неудачные операции)
    if (newQueue.length > 0) {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(newQueue));
      console.log(`SyncQueue: ${newQueue.length} операций остались в очереди`);
    } else {
      this.clearQueue();
    }

    console.log(`SyncQueue: Синхронизация завершена. Успешно: ${successCount}, Ошибок: ${failedCount}`);
    
    return { success: successCount, failed: failedCount, errors };
  }

  // Выполнить одну операцию
  private async executeOperation(operation: PendingOperation): Promise<void> {
    switch (operation.type) {
      case 'CREATE_LIST':
        await apiClient.createList(operation.data);
        break;
        
      case 'DELETE_LIST':
        await apiClient.deleteList(operation.id);
        break;
        
      case 'UPDATE_LIST':
        await apiClient.updateList(operation.id, operation.data);
        break;
        
      case 'ADD_ITEM':
        await apiClient.addItem(operation.listId, operation.data);
        break;
        
      case 'DELETE_ITEM':
        await apiClient.deleteItem(operation.listId, operation.itemId);
        break;
        
      case 'TOGGLE_ITEM':
        await apiClient.toggleItemStatus(operation.listId, operation.itemId);
        break;
        
      case 'UPDATE_ITEM':
        await apiClient.updateItem(operation.listId, operation.itemId, operation.data);
        break;
        
      default:
        throw new Error(`Неизвестный тип операции: ${(operation as any).type}`);
    }
  }

  // Уведомить пользователя о результате синхронизации
  notifySyncResult(result: { success: number; failed: number }): void {
    if (result.success > 0 && result.failed === 0) {
      toast.success(`Синхронизировано: ${result.success} операций`, {
        description: 'Все изменения сохранены на сервере'
      });
    } else if (result.success > 0 && result.failed > 0) {
      toast.warning(`Синхронизировано: ${result.success} из ${result.success + result.failed}`, {
        description: `Не удалось синхронизировать ${result.failed} операций`
      });
    } else if (result.failed > 0) {
      toast.error('Ошибка синхронизации', {
        description: `Не удалось синхронизировать ${result.failed} операций`
      });
    }
  }
}

// Экспортируем единственный экземпляр
export const syncQueue = new SyncQueue();

