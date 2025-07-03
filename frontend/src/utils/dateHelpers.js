import { format, formatDistanceToNow, parseISO, isValid, addDays, subDays, startOfDay, endOfDay, isBefore, isAfter, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';

// Форматирование даты в строку
export const formatDate = (date, formatString = 'dd.MM.yyyy') => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(parsedDate)) return '';

  return format(parsedDate, formatString, { locale: ru });
};

// Форматирование даты и времени
export const formatDateTime = (date) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

// Форматирование только времени
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

// Относительное время (например, "2 часа назад")
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(parsedDate)) return '';

  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: ru });
};

// Форматирование даты для отображения в интерфейсе
export const formatDisplayDate = (date) => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();

  if (!isValid(parsedDate)) return '';

  const diffInDays = differenceInDays(now, parsedDate);

  if (diffInDays === 0) {
    return 'Сегодня';
  } else if (diffInDays === 1) {
    return 'Вчера';
  } else if (diffInDays === -1) {
    return 'Завтра';
  } else if (diffInDays > 0 && diffInDays <= 7) {
    return `${diffInDays} дн. назад`;
  } else if (diffInDays < 0 && diffInDays >= -7) {
    return `Через ${Math.abs(diffInDays)} дн.`;
  } else {
    return formatDate(parsedDate);
  }
};

// Проверка, является ли дата сегодняшней
export const isToday = (date) => {
  if (!date) return false;

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return false;

  const today = startOfDay(new Date());
  const dateToCheck = startOfDay(parsedDate);
  return today.getTime() === dateToCheck.getTime();
}
