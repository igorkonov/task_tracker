// Статусы задач
export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled',
};

// Названия статусов для отображения
export const TASK_STATUS_LABELS = {
  [TASK_STATUSES.TODO]: 'К выполнению',
  [TASK_STATUSES.IN_PROGRESS]: 'В работе',
  [TASK_STATUSES.REVIEW]: 'На проверке',
  [TASK_STATUSES.DONE]: 'Выполнено',
  [TASK_STATUSES.BLOCKED]: 'Заблокировано',
  [TASK_STATUSES.CANCELLED]: 'Отменено',
};

// Цвета статусов
export const TASK_STATUS_COLORS = {
  [TASK_STATUSES.TODO]: '#6B7280',
  [TASK_STATUSES.IN_PROGRESS]: '#3B82F6',
  [TASK_STATUSES.REVIEW]: '#F59E0B',
  [TASK_STATUSES.DONE]: '#10B981',
  [TASK_STATUSES.BLOCKED]: '#EF4444',
  [TASK_STATUSES.CANCELLED]: '#6B7280',
};

// Приоритеты задач
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Названия приоритетов
export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITIES.LOW]: 'Низкий',
  [TASK_PRIORITIES.MEDIUM]: 'Средний',
  [TASK_PRIORITIES.HIGH]: 'Высокий',
  [TASK_PRIORITIES.URGENT]: 'Критический',
};

// Цвета приоритетов
export const TASK_PRIORITY_COLORS = {
  [TASK_PRIORITIES.LOW]: '#10B981',
  [TASK_PRIORITIES.MEDIUM]: '#F59E0B',
  [TASK_PRIORITIES.HIGH]: '#EF4444',
  [TASK_PRIORITIES.URGENT]: '#DC2626',
};

// Иконки приоритетов
export const TASK_PRIORITY_ICONS = {
  [TASK_PRIORITIES.LOW]: '↓',
  [TASK_PRIORITIES.MEDIUM]: '→',
  [TASK_PRIORITIES.HIGH]: '↑',
  [TASK_PRIORITIES.URGENT]: '🔥',
};

// Типы задач
export const TASK_TYPES = {
  TASK: 'task',
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement',
  EPIC: 'epic',
  STORY: 'story',
};

// Названия типов задач
export const TASK_TYPE_LABELS = {
  [TASK_TYPES.TASK]: 'Задача',
  [TASK_TYPES.BUG]: 'Ошибка',
  [TASK_TYPES.FEATURE]: 'Функция',
  [TASK_TYPES.IMPROVEMENT]: 'Улучшение',
  [TASK_TYPES.EPIC]: 'Эпик',
  [TASK_TYPES.STORY]: 'История',
};

// Цвета типов задач
export const TASK_TYPE_COLORS = {
  [TASK_TYPES.TASK]: '#3B82F6',
  [TASK_TYPES.BUG]: '#EF4444',
  [TASK_TYPES.FEATURE]: '#10B981',
  [TASK_TYPES.IMPROVEMENT]: '#8B5CF6',
  [TASK_TYPES.EPIC]: '#F59E0B',
  [TASK_TYPES.STORY]: '#06B6D4',
};

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer',
  TESTER: 'tester',
  USER: 'user',
};

// Названия ролей
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Администратор',
  [USER_ROLES.MANAGER]: 'Менеджер',
  [USER_ROLES.DEVELOPER]: 'Разработчик',
  [USER_ROLES.TESTER]: 'Тестировщик',
  [USER_ROLES.USER]: 'Пользователь',
};

// Права доступа
export const PERMISSIONS = {
  // Задачи
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  DELETE_TASK: 'delete_task',
  ASSIGN_TASK: 'assign_task',

  // Проекты
  CREATE_PROJECT: 'create_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  MANAGE_PROJECT: 'manage_project',

  // Пользователи
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_USERS: 'manage_users',

  // Система
  VIEW_ANALYTICS: 'view_analytics',
  SYSTEM_SETTINGS: 'system_settings',
};

// Настройки колонок по умолчанию
export const DEFAULT_COLUMNS = [
  {
    id: 'todo',
    title: 'К выполнению',
    status: TASK_STATUSES.TODO,
    color: '#6B7280',
    limit: null,
  },
  {
    id: 'in_progress',
    title: 'В работе',
    status: TASK_STATUSES.IN_PROGRESS,
    color: '#3B82F6',
    limit: 3,
  },
  {
    id: 'review',
    title: 'На проверке',
    status: TASK_STATUSES.REVIEW,
    color: '#F59E0B',
    limit: 2,
  },
  {
    id: 'done',
    title: 'Выполнено',
    status: TASK_STATUSES.DONE,
    color: '#10B981',
    limit: null,
  },
];

// Настройки уведомлений
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
};

// Время показа уведомлений (в миллисекундах)
export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
};

// Размеры экранов для адаптивности
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE: 1280,
};

// Настройки пагинации
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Форматы дат
export const DATE_FORMATS = {
  SHORT: 'dd.MM.yyyy',
  MEDIUM: 'dd.MM.yyyy HH:mm',
  LONG: 'dd MMMM yyyy, HH:mm',
  ISO: 'yyyy-MM-dd',
  TIME: 'HH:mm',
};

// Настройки для валидации
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MAX_TASK_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_COMMENT_LENGTH: 1000,
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// URL для API
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  TASKS: '/api/tasks',
  USERS: '/api/users',
  PROJECTS: '/api/projects',
  COMMENTS: '/api/comments',
  ANALYTICS: '/api/analytics',
  FILES: '/api/files',
};

// Настройки локального хранилища
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  DASHBOARD_SETTINGS: 'dashboardSettings',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
};

// Темы
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Языки
export const LANGUAGES = {
  RU: 'ru',
  EN: 'en',
};

// Настройки AI помощника
export const AI_ASSISTANT = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_HISTORY_LENGTH: 50,
  TYPING_DELAY: 1000,
  RESPONSE_TIMEOUT: 30000,
};

// Настройки поиска
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 50,
};

// Настройки drag & drop
export const DRAG_DROP = {
  DRAG_THRESHOLD: 5,
  SCROLL_THRESHOLD: 50,
  SCROLL_SPEED: 10,
};

// Цвета тегов
export const TAG_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#6B7280', '#374151', '#1F2937',
];

// Экспорт всех констант одним объектом
export default {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_ICONS,
  TASK_TYPES,
  TASK_TYPE_LABELS,
  TASK_TYPE_COLORS,
  USER_ROLES,
  USER_ROLE_LABELS,
  PERMISSIONS,
  DEFAULT_COLUMNS,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATION,
  BREAKPOINTS,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION,
  API_ENDPOINTS,
  LOCAL_STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  AI_ASSISTANT,
  SEARCH,
  DRAG_DROP,
  TAG_COLORS,
};
