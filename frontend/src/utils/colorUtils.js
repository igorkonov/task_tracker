// Конвертация hex в RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

// Конвертация RGB в hex
export const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
};

// Получение цвета с прозрачностью
export const getColorWithOpacity = (color, opacity) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};

// Определение яркости цвета
export const getColorBrightness = (color) => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  // Формула для расчета яркости
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
};

// Определение, является ли цвет темным
export const isDarkColor = (color) => {
  return getColorBrightness(color) < 128;
};

// Получение контрастного цвета (черный или белый)
export const getContrastColor = (backgroundColor) => {
  return isDarkColor(backgroundColor) ? '#FFFFFF' : '#000000';
};

// Получение цвета текста для фона
export const getTextColor = (backgroundColor) => {
  return isDarkColor(backgroundColor) ? '#FFFFFF' : '#1F2937';
};

// Осветление цвета
export const lightenColor = (color, amount) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount));
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount));
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount));

  return rgbToHex(r, g, b);
};

// Затемнение цвета
export const darkenColor = (color, amount) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.max(0, Math.floor(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.floor(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.floor(rgb.b * (1 - amount)));

  return rgbToHex(r, g, b);
};

// Генерация цвета на основе строки
export const generateColorFromString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;

  return rgbToHex(r, g, b);
};

// Генерация пастельного цвета
export const generatePastelColor = (str) => {
  const baseColor = generateColorFromString(str);
  return lightenColor(baseColor, 0.3);
};

// Получение цвета аватара
export const getAvatarColor = (name) => {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Получение градиента
export const createGradient = (color1, color2, direction = 'to right') => {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
};

// Получение случайного цвета из палитры
export const getRandomColor = (palette) => {
  const defaultPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  ];

  const colors = palette || defaultPalette;
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

// Валидация hex цвета
export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Нормализация цвета
export const normalizeColor = (color) => {
  if (!color) return '#6B7280';

  // Если это уже hex цвет
  if (isValidHexColor(color)) {
    return color;
  }

  // Если это rgb/rgba строка
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    return rgbToHex(parseInt(r), parseInt(g), parseInt(b));
  }

  // Если это именованный цвет, возвращаем дефолтный
  return '#6B7280';
};

// Получение палитры цветов на основе базового цвета
export const generateColorPalette = (baseColor, count = 5) => {
  const palette = [];
  const step = 1 / (count + 1);

  for (let i = 1; i <= count; i++) {
    if (i <= count / 2) {
      // Осветляем
      palette.push(lightenColor(baseColor, step * i));
    } else {
      // Затемняем
      palette.push(darkenColor(baseColor, step * (i - count / 2)));
    }
  }

  return palette;
};

// Получение дополнительного цвета
export const getComplementaryColor = (color) => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  // Получаем дополнительный цвет (противоположный на цветовом круге)
  const r = 255 - rgb.r;
  const g = 255 - rgb.g;
  const b = 255 - rgb.b;

  return rgbToHex(r, g, b);
};

// Смешивание двух цветов
export const blendColors = (color1, color2, ratio = 0.5) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return rgbToHex(r, g, b);
};

// Получение цвета приоритета
export const getPriorityColor = (priority) => {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    urgent: '#DC2626',
  };

  return colors[priority] || colors.medium;
};

// Получение цвета статуса
export const getStatusColor = (status) => {
  const colors = {
    todo: '#6B7280',
    in_progress: '#3B82F6',
    review: '#F59E0B',
    done: '#10B981',
    blocked: '#EF4444',
    cancelled: '#6B7280',
  };

  return colors[status] || colors.todo;
};

// Получение цвета типа задачи
export const getTaskTypeColor = (type) => {
  const colors = {
    task: '#3B82F6',
    bug: '#EF4444',
    feature: '#10B981',
    improvement: '#8B5CF6',
    epic: '#F59E0B',
    story: '#06B6D4',
  };

  return colors[type] || colors.task;
};

// Создание CSS переменных для цветовой темы
export const createColorTheme = (primaryColor) => {
  const palette = generateColorPalette(primaryColor, 9);

  return {
    '--color-primary-50': lightenColor(primaryColor, 0.9),
    '--color-primary-100': lightenColor(primaryColor, 0.8),
    '--color-primary-200': lightenColor(primaryColor, 0.6),
    '--color-primary-300': lightenColor(primaryColor, 0.4),
    '--color-primary-400': lightenColor(primaryColor, 0.2),
    '--color-primary-500': primaryColor,
    '--color-primary-600': darkenColor(primaryColor, 0.1),
    '--color-primary-700': darkenColor(primaryColor, 0.2),
    '--color-primary-800': darkenColor(primaryColor, 0.3),
    '--color-primary-900': darkenColor(primaryColor, 0.4),
  };
};
