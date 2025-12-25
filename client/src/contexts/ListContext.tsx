import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiClient, GroceryList, GroceryItem } from '@/lib/api';
import { localDB } from '@/lib/db';
import { syncQueue } from '@/lib/syncQueue';
import { toast } from 'sonner';

export type { GroceryList, GroceryItem };

interface ListContextType {
  lists: GroceryList[];
  currentList: GroceryList | null;
  isLoading: boolean;
  isOffline: boolean;
  hasPendingSync: boolean;
  refreshLists: () => Promise<void>;
  addList: (name: string, description?: string, items?: Array<{ name: string; quantity?: number; unit?: string; category?: string }>) => Promise<GroceryList>;
  deleteList: (id: string) => Promise<void>;
  updateList: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  setCurrentList: (list: GroceryList | null) => void;
  loadList: (id: string) => Promise<void>;
  addItemToList: (listId: string, name: string, quantity?: number, unit?: string, category?: string) => Promise<void>;
  removeItemFromList: (listId: string, itemId: string) => Promise<void>;
  toggleItemCompletion: (listId: string, itemId: string) => Promise<void>;
  updateItem: (listId: string, itemId: string, item: Partial<GroceryItem>) => Promise<void>;
  syncPendingOperations: () => Promise<void>;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export function ListProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [currentList, setCurrentList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasPendingSync, setHasPendingSync] = useState(syncQueue.hasPendingOperations());

  // Синхронизировать отложенные операции
  const syncPendingOperations = useCallback(async () => {
    if (!syncQueue.hasPendingOperations()) {
      return;
    }

    console.log('🔄 Начало синхронизации отложенных операций...');
    const result = await syncQueue.syncAll();
    
    syncQueue.notifySyncResult(result);
    setHasPendingSync(syncQueue.hasPendingOperations());
    
    // Обновляем списки после синхронизации
    if (result.success > 0) {
      await refreshLists();
    }
  }, []);

  // Слушаем изменения статуса сети
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Интернет появился!');
      setIsOffline(false);
      toast.success('Подключение восстановлено');
      
      // Автоматически синхронизируем отложенные операции
      if (isAuthenticated && syncQueue.hasPendingOperations()) {
        await syncPendingOperations();
      } else if (isAuthenticated) {
        // Просто обновляем данные
        await refreshLists();
      }
    };

    const handleOffline = () => {
      console.log('📴 Интернет пропал!');
      setIsOffline(true);
      toast.info('Работаем в офлайн-режиме', {
        description: 'Изменения будут синхронизированы при появлении интернета'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, syncPendingOperations]);

  const refreshLists = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('refreshLists: Пользователь не аутентифицирован');
      return;
    }
    
    console.log('refreshLists: Начало загрузки списков...');
    setIsLoading(true);
    
    try {
      // Если есть интернет - загружаем с сервера
      const response = await apiClient.getLists();
      console.log('refreshLists: Получены списки с сервера:', response.lists.length);
      setLists(response.lists);
      
      // Сохраняем в IndexedDB для офлайн-режима
      await localDB.saveLists(response.lists);
      console.log('refreshLists: Списки сохранены в кэш');
      
    } catch (error) {
      console.error('Ошибка при загрузке списков с сервера:', error);
      
      // Если ошибка сети - загружаем из кэша
      try {
        const cachedLists = await localDB.getLists();
        if (cachedLists.length > 0) {
          console.log('refreshLists: Загружены списки из кэша:', cachedLists.length);
          setLists(cachedLists);
          toast.info('Показаны кэшированные данные', {
            description: 'Обновите когда появится интернет'
          });
        } else {
          toast.error('Не удалось загрузить списки');
        }
      } catch (dbError) {
        console.error('Ошибка при загрузке из кэша:', dbError);
        toast.error('Не удалось загрузить списки');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshLists();
    } else {
      setLists([]);
      setCurrentList(null);
    }
  }, [user, isAuthenticated, refreshLists]);

  const loadList = async (id: string) => {
    setIsLoading(true);
    try {
      // Сначала пытаемся загрузить с сервера
      const response = await apiClient.getList(id);
      setCurrentList(response.list);
      
      // Сохраняем в кэш
      await localDB.saveList(response.list);
    } catch (error) {
      console.error('Ошибка при загрузке списка с сервера:', error);
      
      // Если ошибка - пытаемся загрузить из кэша
      try {
        const cachedList = await localDB.getList(id);
        if (cachedList) {
          setCurrentList(cachedList);
          toast.info('Показаны кэшированные данные');
        } else {
          toast.error('Не удалось загрузить список');
          throw error;
        }
      } catch (dbError) {
        console.error('Ошибка при загрузке списка из кэша:', dbError);
        toast.error('Не удалось загрузить список');
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addList = async (
    name: string,
    description?: string,
    items?: Array<{ name: string; quantity?: number; unit?: string; category?: string }>
  ): Promise<GroceryList> => {
    const listData = { name, description, items };
    
    try {
      console.log('ListContext.addList: Начало создания списка', listData);
      
      // Пытаемся создать список на сервере
      const response = await apiClient.createList(listData);
      console.log('ListContext.addList: Ответ от API:', response);
      
      const newList = response.list;
      
      // Сохраняем в локальный кэш
      await localDB.saveList(newList);
      
      setLists(prevLists => {
        const updated = [...prevLists, newList];
        console.log('ListContext.addList: Обновлено локальное состояние, списков:', updated.length);
        return updated;
      });
      
      await refreshLists();
      console.log('ListContext.addList: Списки обновлены');
      
      return newList;
      
    } catch (error) {
      console.error('ListContext.addList: Ошибка:', error);
      
      // Если офлайн - создаем список локально и добавляем в очередь
      if (!navigator.onLine || isOffline) {
        console.log('ListContext.addList: Офлайн-режим, создаем список локально');
        
        // Создаем временный список с локальным ID
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempList: GroceryList = {
          id: tempId,
          name,
          description: description || null,
          userId: user?.id || 'temp-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: items ? items.map((item, index) => ({
            id: `temp-item-${index}`,
            name: item.name,
            quantity: item.quantity || 1,
            unit: item.unit || 'шт.',
            completed: false,
            listId: tempId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) : []
        };
        
        // Сохраняем локально
        await localDB.saveList(tempList);
        setLists(prevLists => [...prevLists, tempList]);
        
        // Добавляем в очередь синхронизации
        syncQueue.addToQueue({
          type: 'CREATE_LIST',
          id: tempId,
          data: listData,
          timestamp: Date.now()
        });
        
        setHasPendingSync(true);
        
        toast.success('Список создан локально', {
          description: 'Будет синхронизирован при появлении интернета'
        });
        
        return tempList;
      }
      
      toast.error(error instanceof Error ? error.message : 'Не удалось создать список');
      throw error;
    }
  };

  const deleteList = async (id: string) => {
    try {
      await apiClient.deleteList(id);
      await localDB.deleteList(id);
      await refreshLists();
      if (currentList?.id === id) {
        setCurrentList(null);
      }
      toast.success('Список удален');
    } catch (error) {
      console.error('Ошибка при удалении списка:', error);
      
      // Если офлайн - добавляем в очередь
      if (!navigator.onLine || isOffline) {
        await localDB.deleteList(id);
        setLists(prevLists => prevLists.filter(l => l.id !== id));
        if (currentList?.id === id) {
          setCurrentList(null);
        }
        
        syncQueue.addToQueue({
          type: 'DELETE_LIST',
          id,
          timestamp: Date.now()
        });
        
        setHasPendingSync(true);
        toast.success('Список удален локально', {
          description: 'Будет синхронизирован при появлении интернета'
        });
        return;
      }
      
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить список');
      throw error;
    }
  };

  const updateList = async (id: string, updates: { name?: string; description?: string }) => {
    try {
      const response = await apiClient.updateList(id, updates);
      await refreshLists();
      if (currentList?.id === id) {
        setCurrentList(response.list);
      }
      toast.success('Список обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении списка:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить список');
      throw error;
    }
  };

  const addItemToList = async (listId: string, name: string, quantity: number = 1, unit: string = 'шт.', category?: string) => {
    try {
      const response = await apiClient.addItem(listId, { name, quantity, unit, category });
      await refreshLists();
      if (currentList?.id === listId) {
        const updatedList = await apiClient.getList(listId);
        setCurrentList(updatedList.list);
      }
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось добавить товар');
      throw error;
    }
  };

  const removeItemFromList = async (listId: string, itemId: string) => {
    try {
      await apiClient.deleteItem(listId, itemId);
      await refreshLists();
      if (currentList?.id === listId) {
        const updatedList = await apiClient.getList(listId);
        setCurrentList(updatedList.list);
      }
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось удалить товар');
      throw error;
    }
  };

  const toggleItemCompletion = async (listId: string, itemId: string) => {
    try {
      const response = await apiClient.toggleItemStatus(listId, itemId);
      await refreshLists();
      if (currentList?.id === listId) {
        const updatedList = await apiClient.getList(listId);
        setCurrentList(updatedList.list);
      }
    } catch (error) {
      console.error('Ошибка при переключении статуса товара:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось изменить статус товара');
      throw error;
    }
  };

  const updateItem = async (listId: string, itemId: string, itemUpdates: Partial<GroceryItem>) => {
    try {
      const { name, quantity, unit, completed } = itemUpdates;
      const response = await apiClient.updateItem(listId, itemId, {
        name,
        quantity,
        unit,
        completed,
      });
      await refreshLists();
      if (currentList?.id === listId) {
        const updatedList = await apiClient.getList(listId);
        setCurrentList(updatedList.list);
      }
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось обновить товар');
      throw error;
    }
  };

  return (
    <ListContext.Provider
      value={{
        lists,
        currentList,
        isLoading,
        isOffline,
        hasPendingSync,
        refreshLists,
        addList,
        deleteList,
        updateList,
        setCurrentList,
        loadList,
        addItemToList,
        removeItemFromList,
        toggleItemCompletion,
        updateItem,
        syncPendingOperations,
      }}
    >
      {children}
    </ListContext.Provider>
  );
}

export function useList() {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useList must be used within ListProvider');
  }
  return context;
}
