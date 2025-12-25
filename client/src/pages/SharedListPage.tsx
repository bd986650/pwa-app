import { useEffect, useState, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, CheckCircle2, Circle, WifiOff } from 'lucide-react';
import { GroceryList } from '@/lib/api';
import { apiClient } from '@/lib/api';
import { localDB } from '@/lib/db';
import { CATEGORY_EMOJIS } from '@/const';
import { toast } from 'sonner';

export default function SharedListPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/shared/:id');
  const [list, setList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    const loadSharedList = async () => {
      setIsLoading(true);
      try {
        // Пытаемся загрузить с сервера
        const response = await apiClient.getSharedList(params.id);
        setList(response.list);
        setIsFromCache(false);
        
        // Сохраняем в кэш
        await localDB.saveSharedList(response.list);
        console.log('SharedListPage: Список сохранен в кэш');
        
      } catch (error) {
        console.error('SharedListPage: Ошибка загрузки с сервера:', error);
        
        // Если ошибка - пытаемся загрузить из кэша
        try {
          const cachedList = await localDB.getSharedList(params.id);
          if (cachedList) {
            setList(cachedList);
            setIsFromCache(true);
            toast.info('Показаны кэшированные данные', {
              description: 'Обновите когда появится интернет'
            });
          } else {
            toast.error('Не удалось загрузить список');
          }
        } catch (dbError) {
          console.error('SharedListPage: Ошибка загрузки из кэша:', dbError);
          toast.error('Не удалось загрузить список');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedList();
  }, [params?.id]);

  // Группируем товары по категориям - ДОЛЖНО БЫТЬ ДО РАННИХ ВОЗВРАТОВ
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, GroceryList['items']> = {};
    
    if (!list?.items) {
      return grouped;
    }
    
    list.items.forEach(item => {
      const category = item.category || 'Без категории';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  }, [list?.items]);

  const completedItems = list?.items?.filter(item => item.completed).length || 0;
  const totalItems = list?.items?.length || 0;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Ранние возвраты ПОСЛЕ всех хуков
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка списка...</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-xl font-semibold text-foreground">Список не найден</h2>
          <p className="text-muted-foreground">Возможно, ссылка устарела или список был удален</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky safe-top bg-white border-b border-border z-10">
        <div className="px-4 py-4 sm:px-6 pt-safe">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setLocation('/auth')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">{list.name}</h1>
              {list.description && (
                <p className="text-sm text-muted-foreground truncate">{list.description}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              📋 Вы просматриваете общий список только для чтения
            </p>
          </div>

          {isFromCache && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-800" />
              <p className="text-sm text-amber-800">
                Офлайн-режим: показаны кэшированные данные
              </p>
            </div>
          )}

          {totalItems > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-medium text-foreground">
                  {completedItems}/{totalItems}
                </span>
              </div>
              <div className="bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 pb-24">
        {totalItems > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Товары</h2>

            {/* Активные товары (не куплены), сгруппированные по категориям */}
            {list.items.filter(item => !item.completed).length > 0 && (
              <div className="space-y-4">
                {Object.entries(itemsByCategory)
                  .filter(([_, items]) => items.some(item => !item.completed))
                  .map(([category, items]) => {
                    const activeItems = items.filter(item => !item.completed);
                    if (activeItems.length === 0) return null;
                    
                    const emoji = CATEGORY_EMOJIS[category] || '📦';
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <span>{emoji}</span>
                          <span>{category}</span>
                          <span className="text-xs">({activeItems.length})</span>
                        </h3>
                        <div className="space-y-2">
                          {activeItems.map(item => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg"
                            >
                              <div className="flex-shrink-0 text-muted-foreground">
                                <Circle className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} {item.unit}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Куплено товары */}
            {list.items.filter(item => item.completed).length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">✓ Куплено</h3>
                {list.items
                  .filter(item => item.completed)
                  .map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-4 bg-secondary border border-border rounded-lg opacity-60"
                    >
                      <div className="flex-shrink-0 text-primary">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground line-through">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                          {item.category && ` • ${item.category}`}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {totalItems === 0 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Нет товаров</h2>
              <p className="text-muted-foreground text-sm mt-1">
                В этом списке пока нет товаров
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

