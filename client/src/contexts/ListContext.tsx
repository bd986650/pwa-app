import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiClient, GroceryList, GroceryItem } from '@/lib/api';
import { toast } from 'sonner';

export type { GroceryList, GroceryItem };

interface ListContextType {
  lists: GroceryList[];
  currentList: GroceryList | null;
  isLoading: boolean;
  refreshLists: () => Promise<void>;
  addList: (name: string, description?: string, items?: Array<{ name: string; quantity?: number; unit?: string }>) => Promise<GroceryList>;
  deleteList: (id: string) => Promise<void>;
  updateList: (id: string, updates: { name?: string; description?: string }) => Promise<void>;
  setCurrentList: (list: GroceryList | null) => void;
  loadList: (id: string) => Promise<void>;
  addItemToList: (listId: string, name: string, quantity?: number, unit?: string) => Promise<void>;
  removeItemFromList: (listId: string, itemId: string) => Promise<void>;
  toggleItemCompletion: (listId: string, itemId: string) => Promise<void>;
  updateItem: (listId: string, itemId: string, item: Partial<GroceryItem>) => Promise<void>;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export function ListProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [currentList, setCurrentList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshLists = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('refreshLists: Пользователь не аутентифицирован');
      return;
    }
    
    console.log('refreshLists: Начало загрузки списков...');
    setIsLoading(true);
    try {
      // Используем fetch с no-cache для гарантии получения свежих данных
      const response = await apiClient.getLists();
      console.log('refreshLists: Получены списки:', response.lists);
      setLists(response.lists);
      console.log('refreshLists: Списки обновлены в состоянии, количество:', response.lists.length);
    } catch (error) {
      console.error('Ошибка при загрузке списков:', error);
      toast.error('Не удалось загрузить списки');
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
      const response = await apiClient.getList(id);
      setCurrentList(response.list);
    } catch (error) {
      console.error('Ошибка при загрузке списка:', error);
      toast.error('Не удалось загрузить список');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addList = async (
    name: string,
    description?: string,
    items?: Array<{ name: string; quantity?: number; unit?: string }>
  ): Promise<GroceryList> => {
    try {
      console.log('ListContext.addList: Начало создания списка', { name, description, items });
      const response = await apiClient.createList({ name, description, items });
      console.log('ListContext.addList: Ответ от API:', response);
      
      const newList = response.list;
      setLists(prevLists => {
        const updated = [...prevLists, newList];
        console.log('ListContext.addList: Обновлено локальное состояние, списков:', updated.length);
        return updated;
      });
      
      console.log('ListContext.addList: Обновление списков через API...');
      await refreshLists();
      console.log('ListContext.addList: Списки обновлены');
      
      return newList;
    } catch (error) {
      console.error('ListContext.addList: Ошибка:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось создать список');
      throw error;
    }
  };

  const deleteList = async (id: string) => {
    try {
      await apiClient.deleteList(id);
      await refreshLists();
      if (currentList?.id === id) {
        setCurrentList(null);
      }
      toast.success('Список удален');
    } catch (error) {
      console.error('Ошибка при удалении списка:', error);
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

  const addItemToList = async (listId: string, name: string, quantity: number = 1, unit: string = 'шт.') => {
    try {
      const response = await apiClient.addItem(listId, { name, quantity, unit });
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
