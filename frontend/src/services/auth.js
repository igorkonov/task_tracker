import api from './api.js';

// Константы для localStorage
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Класс для управления аутентификацией
class AuthService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
    this.user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Авторизация пользователя
  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { access_token, refresh_token, user } = response.data;

      this.setAuthData(access_token, refresh_token, user);

      return {
        success: true,
        user,
        token: access_token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка авторизации',
      };
    }
  }

  // Регистрация пользователя
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { access_token, refresh_token, user } = response.data;

      this.setAuthData(access_token, refresh_token, user);

      return {
        success: true,
        user,
        token: access_token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка регистрации',
      };
    }
  }

  // Выход из системы
  async logout() {
    try {
      if (this.token) {
        await api.post('/api/auth/logout', {
          refresh_token: this.refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Обновление токена
  async refreshAuthToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/api/auth/refresh', {
        refresh_token: this.refreshToken,
      });

      const { access_token, refresh_token } = response.data;

      this.setTokens(access_token, refresh_token);

      return access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw error;
    }
  }

  // Проверка валидности токена
  async validateToken() {
    try {
      if (!this.token) return false;

      const response = await api.get('/api/auth/validate');
      return response.data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Восстановление пароля
  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка восстановления пароля',
      };
    }
  }

  // Сброс пароля
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        new_password: newPassword,
      });

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка сброса пароля',
      };
    }
  }

  // Изменение пароля
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка изменения пароля',
      };
    }
  }

  // Получение текущего пользователя
  async getCurrentUser() {
    try {
      if (!this.token) return null;

      const response = await api.get('/api/users/me');
      const user = response.data;

      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Проверка аутентификации
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Получение пользователя
  getUser() {
    return this.user;
  }

  // Получение токена
  getToken() {
    return this.token;
  }

  // Получение роли пользователя
  getUserRole() {
    return this.user?.role || 'user';
  }

  // Проверка прав доступа
  hasPermission(permission) {
    const userPermissions = this.user?.permissions || [];
    return userPermissions.includes(permission);
  }

  // Проверка роли
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // Установка данных аутентификации
  setAuthData(token, refreshToken, user) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = user;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Установка токенов
  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Установка пользователя
  setUser(user) {
    this.user = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Очистка данных аутентификации
  clearAuthData() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Автоматическое обновление токена
  setupTokenRefresh() {
    if (!this.refreshToken) return;

    // Проверяем токен каждые 15 минут
    setInterval(async () => {
      try {
        await this.refreshAuthToken();
      } catch (error) {
        console.error('Auto token refresh failed:', error);
      }
    }, 15 * 60 * 1000);
  }

  // Декодирование JWT токена
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  // Проверка истечения токена
  isTokenExpired(token = this.token) {
    if (!token) return true;

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  }

  // Проверка токена
  async verifyToken(token) {
    return { id: 'mockUserId', name: 'Mock User', email: 'mock@example.com' };
  }
}

// Создаем и экспортируем экземпляр
const authService = new AuthService();

// Настраиваем автоматическое обновление токена
authService.setupTokenRefresh();

export default authService;
