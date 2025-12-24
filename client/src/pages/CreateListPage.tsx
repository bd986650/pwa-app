import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useList } from '@/contexts/ListContext';
import { toast } from 'sonner';

export default function CreateListPage() {
  const [, setLocation] = useLocation();
  const { addList } = useList();

  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [items, setItems] = useState<Array<{ name: string; quantity: number; unit: string }>>([
    { name: '', quantity: 1, unit: 'шт.' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'шт.' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'name' | 'quantity' | 'unit',
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listName.trim()) {
      toast.error('Пожалуйста, введите название списка');
      return;
    }

    setIsSubmitting(true);

    try {
      const validItems = items
        .filter(item => item.name.trim())
        .map(item => ({
          name: item.name.trim(),
          quantity: item.quantity,
          unit: item.unit,
        }));

      console.log('Создание списка:', {
        name: listName.trim(),
        description: listDescription.trim() || undefined,
        items: validItems.length > 0 ? validItems : undefined
      });

      console.log('CreateListPage: Вызов addList...');
      const createdList = await addList(
        listName.trim(),
        listDescription.trim() || undefined,
        validItems.length > 0 ? validItems : undefined
      );
      
      console.log('CreateListPage: Список создан:', createdList);
      toast.success('Список создан');
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('CreateListPage: Перенаправление на главную...');
      setLocation('/main');
    } catch (error) {
      console.error('Ошибка при создании списка:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky safe-top bg-white border-b border-border z-10">
        <div className="px-4 py-4 sm:px-6 pt-safe flex items-center gap-3">
          <button
            onClick={() => setLocation('/main')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Новый список</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 sm:px-6 max-w-2xl mx-auto pb-24">
        <div className="space-y-2 mb-6">
          <label className="block text-sm font-medium text-foreground">
            Название списка *
          </label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Например: Продукты на неделю"
            className="w-full px-4 py-3 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-2 mb-8">
          <label className="block text-sm font-medium text-foreground">
            Описание (опционально)
          </label>
          <textarea
            value={listDescription}
            onChange={(e) => setListDescription(e.target.value)}
            placeholder="Добавьте дополнительную информацию..."
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Товары</h2>
            <span className="text-sm text-muted-foreground">{items.length}</span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="flex gap-3 items-end bg-secondary p-4 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="Название товара"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div className="w-20">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  className="w-full px-2 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-center"
                />
              </div>

              <div className="w-24">
                <select
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                  className="w-full px-2 py-2 border border-border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option>шт.</option>
                  <option>кг</option>
                  <option>л</option>
                  <option>мл</option>
                  <option>г</option>
                  <option>упак.</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-3 border-2 border-dashed border-border rounded-lg text-primary hover:bg-secondary transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить товар
          </button>
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            type="button"
            onClick={() => setLocation('/main')}
            variant="outline"
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-emerald-600 text-white"
          >
            {isSubmitting ? 'Создание...' : 'Создать список'}
          </Button>
        </div>
      </form>
    </div>
  );
}
