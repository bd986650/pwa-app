import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, RefreshCw, Share2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useList } from '@/contexts/ListContext';
import { PRODUCT_CATEGORIES, CATEGORY_EMOJIS } from '@/const';
import { toast } from 'sonner';

export default function ListDetailPage() {
  const [, setLocation] = useLocation();
  const { currentList, addItemToList, removeItemFromList, toggleItemCompletion, isLoading, isOffline, loadList } =
    useList();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('шт.');
  const [newItemCategory, setNewItemCategory] = useState('Без категории');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Группируем товары по категориям
  const itemsByCategory = useMemo(() => {
    if (!currentList?.items) {
      return {};
    }
    
    const grouped: Record<string, typeof currentList.items> = {};
    
    currentList.items.forEach(item => {
      const category = item.category || 'Без категории';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  }, [currentList?.items]);

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

  if (!currentList) {
    setLocation('/main');
    return null;
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newItemName.trim()) {
      toast.error('Пожалуйста, введите название товара');
      return;
    }

    try {
      await addItemToList(
        currentList.id, 
        newItemName.trim(), 
        newItemQuantity, 
        newItemUnit,
        newItemCategory === 'Без категории' ? undefined : newItemCategory
      );
      setNewItemName('');
      setNewItemQuantity(1);
      setNewItemUnit('шт.');
      setNewItemCategory('Без категории');
    } catch (error) {
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await removeItemFromList(currentList.id, itemId);
      } catch (error) {
      }
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      await toggleItemCompletion(currentList.id, itemId);
    } catch (error) {
    }
  };

  const handleRefresh = async () => {
    if (!currentList) return;
    
    setIsRefreshing(true);
    try {
      await loadList(currentList.id);
      toast.success('Список обновлен');
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!currentList) return;
    
    const shareUrl = `${window.location.origin}/shared/${currentList.id}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Ссылка скопирована в буфер обмена');
      setShareDialogOpen(false);
    }).catch(() => {
      toast.error('Не удалось скопировать ссылку');
    });
  };

  const completedItems = currentList.items.filter(item => item.completed).length;
  const totalItems = currentList.items.length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky safe-top bg-white border-b border-border z-10">
        <div className="px-4 py-4 sm:px-6 pt-safe">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setLocation('/main')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">{currentList.name}</h1>
              {currentList.description && (
                <p className="text-sm text-muted-foreground truncate">{currentList.description}</p>
              )}
            </div>
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  title="Поделиться списком"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Поделиться списком</DialogTitle>
                  <DialogDescription>
                    Скопируйте ссылку для просмотра списка. Получатели смогут только просматривать список, но не редактировать его.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/shared/${currentList.id}`}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-foreground text-sm focus:outline-none"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCopyShareLink}
                        className="bg-primary hover:bg-emerald-600 text-white"
                      >
                        Копировать
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Обновить список"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isOffline && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-800" />
              <p className="text-sm text-amber-800">
                Офлайн-режим: изменения будут синхронизированы при появлении интернета
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
          <div className="space-y-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground">Товары</h2>

            {/* Активные товары (не куплены), сгруппированные по категориям */}
            {currentList.items.filter(item => !item.completed).length > 0 && (
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
                              className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:shadow-sm transition-shadow"
                            >
                              <button
                                onClick={() => handleToggleItem(item.id)}
                                className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Circle className="w-6 h-6" />
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} {item.unit}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Куплено товары */}
            {currentList.items.filter(item => item.completed).length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">✓ Куплено</h3>
                {currentList.items
                  .filter(item => item.completed)
                  .map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-4 bg-secondary border border-border rounded-lg opacity-60"
                    >
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className="flex-shrink-0 text-primary transition-colors"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground line-through">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                          {item.category && ` • ${item.category}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                Добавьте товары, чтобы начать покупки
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleAddItem} className="space-y-4 bg-secondary p-4 rounded-lg">
          <h3 className="font-semibold text-foreground">Добавить товар</h3>

          <div className="space-y-3">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Название товара"
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {PRODUCT_CATEGORIES.map(category => {
                const emoji = CATEGORY_EMOJIS[category] || '📦';
                return (
                  <option key={category} value={category}>
                    {emoji} {category}
                  </option>
                );
              })}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-20 px-3 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
              />

              <select
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option>шт.</option>
                <option>кг</option>
                <option>л</option>
                <option>мл</option>
                <option>г</option>
                <option>упак.</option>
              </select>

              <Button
                type="submit"
                className="bg-primary hover:bg-emerald-600 text-white px-4"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
