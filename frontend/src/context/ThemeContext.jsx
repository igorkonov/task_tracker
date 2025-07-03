import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Получаем сохраненную тему из localStorage или используем 'default'
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('task-tracker-theme');
    return savedTheme || 'default';
  });

  // Функция для смены темы
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('task-tracker-theme', newTheme);
  };

  // Применяем тему к корневому элементу
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    console.log('Theme applied:', theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    themes: [
      { id: 'default', name: 'По умолчанию', icon: '🌟' },
      { id: 'space', name: 'Космос', icon: '🌌' },
      { id: 'sunset', name: 'Закат', icon: '🌅' },
      { id: 'ocean', name: 'Океан', icon: '🌊' },
      { id: 'forest', name: 'Лес', icon: '🌲' },
      { id: 'neon', name: 'Неон', icon: '⚡' },
      { id: 'magic', name: 'Магия', icon: '🔮' }
    ]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
