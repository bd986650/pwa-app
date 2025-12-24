import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

export default function DeviceCheck({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(() => {
    // Инициализируем на основе текущей ширины окна
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return true;
  });

  useEffect(() => {
    // Проверка ширины экрана
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="flex justify-center">
            <div className="bg-secondary p-6 rounded-full">
              <Smartphone className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Мобильное приложение</h1>
            <p className="text-muted-foreground text-lg">
              Это приложение оптимизировано только для мобильных устройств. Пожалуйста, откройте его на смартфоне или планшете.
            </p>
          </div>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Минимальная ширина экрана: 1024px
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
