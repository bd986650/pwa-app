import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, ShoppingCart, Trash2, ChevronRight, LogOut, RefreshCw, WifiOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useList } from '@/contexts/ListContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export default function MainPage() {
  const [, setLocation] = useLocation();
  const { lists, deleteList, loadList, isLoading, isOffline, hasPendingSync, refreshLists, syncPendingOperations } = useList();
  const { user, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    console.log('MainPage: Компонент смонтирован');
    console.log('MainPage: Текущее количество списков в состоянии:', lists.length);
    
    const loadLists = async () => {
      try {
        await refreshLists();
        setTimeout(() => {
          console.log('MainPage: После обновления, списков:', lists.length);
        }, 100);
      } catch (error) {
        console.error('MainPage: Ошибка при загрузке списков:', error);
      }
    };
    
    loadLists();
  }, []);

  const handleCreateList = () => {
    setLocation('/create-list');
  };

  const handleSelectList = async (listId: string) => {
    try {
      await loadList(listId);
      setLocation('/list-detail');
    } catch (error) {
      console.error('Ошибка при загрузке списка:', error);
    }
  };

  const handleDeleteList = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить этот список?')) {
      try {
        await deleteList(listId);
      } catch (error) {
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      logout();
      toast.success('Выход выполнен');
      setLocation('/auth');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshLists();
      toast.success('Списки обновлены');
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingOperations();
    } catch (error) {
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky safe-top bg-white border-b border-border z-10">
        <div className="px-4 py-4 sm:px-6 pt-safe">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Мои списки</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {lists.length} {lists.length === 1 ? 'список' : 'списков'}
                {user && ` • ${user.name}`}
              </p>
            </div>
            {hasPendingSync && !isOffline && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="p-2 hover:bg-secondary rounded-lg transition-colors text-amber-600 hover:text-amber-700 disabled:opacity-50"
                title="Синхронизировать отложенные изменения"
              >
                <Upload className={`w-5 h-5 ${isSyncing ? 'animate-bounce' : ''}`} />
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Обновить списки"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          {isOffline && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-800" />
              <p className="text-sm text-amber-800">
                Офлайн-режим: показаны кэшированные данные
              </p>
            </div>
          )}
          
          {hasPendingSync && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-800" />
                <p className="text-sm text-blue-800">
                  Есть несинхронизированные изменения
                </p>
              </div>
              {!isOffline && (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="text-sm font-medium text-blue-800 hover:text-blue-900 disabled:opacity-50"
                >
                  {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Загрузка списков...</p>
            </div>
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="bg-secondary p-8 rounded-full">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Нет списков</h2>
              <p className="text-muted-foreground max-w-sm">
                Создайте свой первый список покупок, чтобы начать управлять покупками
              </p>
            </div>
            <Button
              onClick={handleCreateList}
              className="bg-primary hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Создать список
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => {
              const completedItems = list.items.filter(item => item.completed).length;
              const totalItems = list.items.length;
              const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

              return (
                <div
                  key={list.id}
                  onClick={() => handleSelectList(list.id)}
                  className="bg-white border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow active:bg-secondary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{list.name}</h3>
                      {list.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">{list.description}</p>
                      )}
                      <div className="mt-3 space-y-2">
                        {totalItems > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {completedItems}/{totalItems}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Обновлено {formatDistanceToNow(new Date(list.updatedAt), { locale: ru, addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteList(e, list.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleCreateList}
        className="fixed bottom-6 right-6 bg-primary hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center"
        style={{ bottom: `calc(1.5rem + env(safe-area-inset-bottom))` }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
