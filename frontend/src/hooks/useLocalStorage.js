import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Получение значения из localStorage
  const getStoredValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Функция для установки значения
  const setValue = useCallback((value) => {
    try {
      // Позволяем функции-сеттеру
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Функция для удаления значения
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Слушаем изменения в других вкладках
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== e.oldValue) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Специальный хук для настроек приложения
export const useAppSettings = () => {
  const [settings, setSettings] = useLocalStorage('appSettings', {
    theme: 'auto',
    language: 'en',
    notifications: true,
    soundEffects: true,
    autoSave: true,
    columnWidth: 'auto',
    taskDensity: 'normal'
  });

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings({
      theme: 'auto',
      language: 'en',
      notifications: true,
      soundEffects: true,
      autoSave: true,
      columnWidth: 'auto',
      taskDensity: 'normal'
    });
  }, [setSettings]);

  return { settings, updateSetting, resetSettings };
};

// Хук для последних действий пользователя
export const useRecentActions = () => {
  const [recentActions, setRecentActions] = useLocalStorage('recentActions', []);

  const addAction = useCallback((action) => {
    const newAction = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...action
    };

    setRecentActions(prev => {
      const updated = [newAction, ...prev.slice(0, 9)]; // Храним только 10 последних действий
      return updated;
    });
  }, [setRecentActions]);

  const clearActions = useCallback(() => {
    setRecentActions([]);
  }, [setRecentActions]);

  return { recentActions, addAction, clearActions };
};

// Хук для сохранения позиции скролла
export const useScrollPosition = (key) => {
  const [scrollPosition, setScrollPosition] = useLocalStorage(`scroll_${key}`, 0);

  const saveScrollPosition = useCallback((position) => {
    setScrollPosition(position);
  }, [setScrollPosition]);

  const restoreScrollPosition = useCallback((element) => {
    if (element && scrollPosition) {
      element.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return { scrollPosition, saveScrollPosition, restoreScrollPosition };
};
