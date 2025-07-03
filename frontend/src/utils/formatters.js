// utils/formatters.js
import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date, formatString = 'dd.MM.yyyy') => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const formatTimeAgo = (date) => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: ru
    });
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return '';
  }
};

export const formatRelativeDate = (date) => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return 'Сегодня';
    } else if (isYesterday(dateObj)) {
      return 'Вчера';
    } else if (isTomorrow(dateObj)) {
      return 'Завтра';
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return formatDate(date);
  }
};

export const formatPriority = (priority) => {
  const priorityMap = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  };

  return priorityMap[priority] || priority;
};

export const formatStatus = (status) => {
  const statusMap = {
    'todo': 'К выполнению',
    'in-progress': 'В работе',
    'review': 'На проверке',
    'done': 'Выполнено'
  };

  return statusMap[status] || status;
};

export const formatTaskTitle = (title, maxLength = 50) => {
  if (!title) return '';

  if (title.length <= maxLength) {
    return title;
  }

  return title.substring(0, maxLength - 3) + '...';
};

export const formatTaskDescription = (description, maxLength = 100) => {
  if (!description) return '';

  if (description.length <= maxLength) {
    return description;
  }

  return description.substring(0, maxLength - 3) + '...';
};

export const formatUserName = (user) => {
  if (!user) return 'Неизвестный пользователь';

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.name) {
    return user.name;
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'Неизвестный пользователь';
};

export const formatUserInitials = (user) => {
  if (!user) return '??';

  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  if (user.name) {
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }

  return '??';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '');

  // Форматируем российские номера
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }

  // Форматируем номера без кода страны
  if (cleaned.length === 10) {
    return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8)}`;
  }

  return phone;
};

export const formatCurrency = (amount, currency = 'RUB') => {
  if (typeof amount !== 'number') return '';

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (number) => {
  if (typeof number !== 'number') return '';

  return new Intl.NumberFormat('ru-RU').format(number);
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';

  const percentage = (value / total) * 100;
  return `${Math.round(percentage)}%`;
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0 мин';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} мин`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${remainingMinutes} мин`;
};

export const formatTaskEstimate = (estimate) => {
  if (!estimate) return 'Не указано';

  if (estimate < 60) {
    return `${estimate} мин`;
  }

  const hours = Math.floor(estimate / 60);
  const minutes = estimate % 60;

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
};

export const formatTag = (tag) => {
  if (!tag) return '';

  return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
};

export const formatSearchResults = (query, text, maxLength = 100) => {
  if (!query || !text) return text;

  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return formatTaskDescription(text, maxLength);
  }

  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + query.length + 20);

  let result = text.substring(start, end);

  if (start > 0) {
    result = '...' + result;
  }

  if (end < text.length) {
    result = result + '...';
  }

  return result;
};

export const formatApiError = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка';
};
