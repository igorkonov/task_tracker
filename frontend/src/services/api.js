import axios from 'axios';

// Базовая конфигурация API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Моки для задач и пользователей
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

function getMockTasks() {
  return JSON.parse(localStorage.getItem('mock_tasks') || '[]');
}
function setMockTasks(tasks) {
  localStorage.setItem('mock_tasks', JSON.stringify(tasks));
}
function getMockUsers() {
  return JSON.parse(localStorage.getItem('mock_users') || '[{"id":"1","name":"Demo User"}]');
}
function setMockUsers(users) {
  localStorage.setItem('mock_users', JSON.stringify(users));
}

// API методы для задач
export const tasksAPI = USE_MOCKS ? {
  getTasks: async () => getMockTasks(),
  getTask: async (id) => getMockTasks().find(t => t.id === id),
  createTask: async (taskData) => {
    const tasks = getMockTasks();
    const tags = Array.isArray(taskData.tags) ? taskData.tags : [];
    const newTask = { ...taskData, id: Date.now().toString(), tags };
    setMockTasks([...tasks, newTask]);
    return newTask;
  },
  updateTask: async (id, taskData) => {
    let tasks = getMockTasks();
    const tags = Array.isArray(taskData.tags) ? taskData.tags : [];
    tasks = tasks.map(t => t.id === id ? { ...t, ...taskData, tags } : t);
    setMockTasks(tasks);
    return tasks.find(t => t.id === id);
  },
  deleteTask: async (id) => {
    let tasks = getMockTasks();
    setMockTasks(tasks.filter(t => t.id !== id));
    return true;
  },
  updateTaskStatus: async (id, status) => {
    let tasks = getMockTasks();
    tasks = tasks.map(t => t.id === id ? { ...t, status } : t);
    setMockTasks(tasks);
    return tasks.find(t => t.id === id);
  },
  assignTask: async (id, assigneeId) => {
    let tasks = getMockTasks();
    tasks = tasks.map(t => t.id === id ? { ...t, assignee_id: assigneeId } : t);
    setMockTasks(tasks);
    return tasks.find(t => t.id === id);
  },
  bulkUpdateTasks: async (ids, updates) => {
    let tasks = getMockTasks();
    tasks = tasks.map(t => ids.includes(t.id) ? { ...t, ...updates } : t);
    setMockTasks(tasks);
    return true;
  }
} : {
  // Получить все задачи
  getTasks: () => api.get('/api/tasks'),

  // Получить задачу по ID
  getTask: (id) => api.get(`/api/tasks/${id}`),

  // Создать новую задачу
  createTask: (taskData) => api.post('/api/tasks', taskData),

  // Обновить задачу
  updateTask: (id, taskData) => api.put(`/api/tasks/${id}`, taskData),

  // Удалить задачу
  deleteTask: (id) => api.delete(`/api/tasks/${id}`),

  // Изменить статус задачи
  updateTaskStatus: (id, status) => api.patch(`/api/tasks/${id}/status`, { status }),

  // Назначить исполнителя
  assignTask: (id, assigneeId) => api.patch(`/api/tasks/${id}/assign`, { assignee_id: assigneeId }),
};

// API методы для пользователей
export const usersAPI = USE_MOCKS ? {
  getUsers: async () => getMockUsers(),
  getProfile: async () => getMockUsers()[0],
  updateProfile: async (userData) => {
    let users = getMockUsers();
    users[0] = { ...users[0], ...userData };
    setMockUsers(users);
    return users[0];
  },
  uploadAvatar: async (formData) => {
    // Просто заглушка
    return { url: 'mock_avatar.png' };
  }
} : {
  // Получить всех пользователей
  getUsers: () => api.get('/api/users'),

  // Получить профиль текущего пользователя
  getProfile: () => api.get('/api/users/me'),

  // Обновить профиль
  updateProfile: (userData) => api.put('/api/users/me', userData),

  // Загрузить аватар
  uploadAvatar: (formData) => api.post('/api/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// API методы для проектов
export const projectsAPI = {
  // Получить все проекты
  getProjects: () => api.get('/api/projects'),

  // Создать проект
  createProject: (projectData) => api.post('/api/projects', projectData),

  // Обновить проект
  updateProject: (id, projectData) => api.put(`/api/projects/${id}`, projectData),

  // Удалить проект
  deleteProject: (id) => api.delete(`/api/projects/${id}`),
};

// API методы для комментариев
export const commentsAPI = {
  // Получить комментарии к задаче
  getTaskComments: (taskId) => api.get(`/api/tasks/${taskId}/comments`),

  // Добавить комментарий
  createComment: (taskId, commentData) => api.post(`/api/tasks/${taskId}/comments`, commentData),

  // Удалить комментарий
  deleteComment: (commentId) => api.delete(`/api/comments/${commentId}`),
};

// API методы для статистики
export const analyticsAPI = {
  // Получить статистику дашборда
  getDashboardStats: () => api.get('/api/analytics/dashboard'),

  // Получить статистику по проектам
  getProjectStats: (projectId) => api.get(`/api/analytics/projects/${projectId}`),

  // Получить статистику по времени
  getTimeStats: (period) => api.get(`/api/analytics/time?period=${period}`),
};

// Обработка ошибок API
export const handleAPIError = (error) => {
  const message = error.response?.data?.message || error.message || 'Произошла ошибка';
  const status = error.response?.status;

  console.error('API Error:', {
    message,
    status,
    data: error.response?.data,
  });

  return {
    message,
    status,
    isNetworkError: !error.response,
  };
};

// Утилита для загрузки файлов
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

if (USE_MOCKS) {
  // Автозаполнение мок-данных при первом запуске
  if (!localStorage.getItem('mock_users')) {
    setMockUsers([
      { id: '1', name: 'Demo User', email: 'demo@demo.com', avatar: '', role: 'user' },
      { id: '2', name: 'Alice', email: 'alice@demo.com', avatar: '', role: 'user' },
      { id: '3', name: 'Bob', email: 'bob@demo.com', avatar: '', role: 'user' }
    ]);
  }
  if (!localStorage.getItem('mock_tasks')) {
    setMockTasks([
      { id: '101', title: 'Пример задачи', description: 'Это пример задачи для теста', status: 'todo', priority: 'medium', assignee_id: '1', tags: ['demo'], due_date: '', created_by: '1', created_at: new Date().toISOString() },
      { id: '102', title: 'Вторая задача', description: 'Еще одна задача', status: 'inprogress', priority: 'high', assignee_id: '2', tags: ['urgent'], due_date: '', created_by: '2', created_at: new Date().toISOString() }
    ]);
  }
}

export default api;
