import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import Button from '../common/Button/Button';
import Avatar from '../Avatar/Avatar';
import './UserProfile.css';

// Helper component for displaying fields in view mode
const ProfileField = ({ label, value, isBio = false }) => (
  <div className="user-profile-field">
    <span className="user-profile-label">{label}</span>
    <p className={`user-profile-value ${isBio ? 'bio' : ''}`}>
      {value || 'Не указано'}
    </p>
  </div>
);

const UserProfile = ({ onLogout }) => {
  const { user, updateProfile, logout } = useAuthContext();
  const { tasks } = useTasks();
  const { updateUser, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    department: '',
    position: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});

  // Инициализация formData при изменении user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Сбрасываем на первую вкладку при переключении режима редактирования
  useEffect(() => {
    if (isEditing) {
      setActiveTab('main');
    }
  }, [isEditing]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    setErrors(prev => ({ ...prev, avatar: '' }));

    try {
      // Проверка размера файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Размер файла не должен превышать 5MB');
      }

      // Проверка типа файла
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Поддерживаются только изображения (JPEG, PNG, GIF, WebP)');
      }

      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setImagePreview(base64);
        setFormData(prev => ({
          ...prev,
          avatar: base64
        }));
        setIsUploadingImage(false);
      };

      reader.onerror = () => {
        throw new Error('Ошибка при загрузке файла');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        avatar: error.message
      }));
      setIsUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Имя не должно превышать 50 символов';
    }

    // Валидация email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Некорректный email адрес';
    }

    // Валидация био (необязательное поле)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Описание не должно превышать 500 символов';
    }

    // Валидация отдела
    if (formData.department && formData.department.length > 100) {
      newErrors.department = 'Название отдела не должно превышать 100 символов';
    }

    // Валидация должности
    if (formData.position && formData.position.length > 100) {
      newErrors.position = 'Название должности не должно превышать 100 символов';
    }

    // Валидация телефона (необязательное поле)
    if (formData.phone && formData.phone.trim()) {
      // Более строгая валидация телефона
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Некорректный номер телефона';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    try {
      // Подготавливаем данные для отправки
      const dataToSubmit = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        phone: formData.phone.trim()
      };

      await updateProfile(dataToSubmit);
      setIsEditing(false);
      setImagePreview(null);

      // Показываем уведомление об успехе (можно добавить toast)
      console.log('Профиль успешно обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Ошибка при обновлении профиля. Попробуйте еще раз.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Восстанавливаем исходные данные
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || ''
      });
    }
    setIsEditing(false);
    setImagePreview(null);
    setErrors({});
  };

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      await logout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Ошибка при выходе из системы'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAvatar = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({
      ...prev,
      avatar: ''
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const currentAvatar = imagePreview || formData.avatar;
  const hasAvatar = Boolean(currentAvatar);

  // Create stats object from user and tasks data
  const stats = React.useMemo(() => {
    return {
      tasksCompleted: tasks.filter(task => task.status === 'done').length,
      tasksInProgress: tasks.filter(task => task.status === 'inprogress').length,
      totalTasks: tasks.length,
    };
  }, [tasks]);

  const isLoading = authLoading || !user;

  if (isLoading) {
    return (
      <div className="user-profile-container is-loading">
        <div className="user-profile-loading-spinner">
          {/* Можно вставить полноценный компонент спиннера */}
          Загрузка профиля...
        </div>
      </div>
    );
  }

  return (
    <div className={`user-profile-container ${isEditing ? 'is-editing' : 'is-viewing'}`}>
      <div className="user-profile-header">
        <h2 className="user-profile-title">
          {isEditing ? 'Редактировать профиль' : 'Профиль пользователя'}
        </h2>
        {!isEditing && (
          <Button variant="secondary" className="header-button" onClick={() => setIsEditing(true)}>
            Редактировать
          </Button>
        )}
      </div>

      <div className="user-profile-content-wrapper">
        <div className="user-profile-avatar-section">
          <div
            className={`user-profile-avatar-container ${!hasAvatar ? 'has-no-avatar' : ''} ${isUploadingImage ? 'user-profile-avatar-loading' : ''} ${isEditing ? 'is-editable' : ''}`}
            onClick={handleAvatarClick}
          >
            {isEditing && (
              <div className="user-profile-avatar-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>{hasAvatar ? 'Сменить' : 'Загрузить'}</span>
              </div>
            )}

            <Avatar
              user={{ name: formData.name, avatar: currentAvatar }}
              size="xl"
              className="user-profile-avatar"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="user-profile-avatar-input"
              disabled={isUploadingImage || isSubmitting}
            />
          </div>

          {errors.avatar && (
            <div className="user-profile-avatar-error">
              {errors.avatar}
            </div>
          )}
          {isEditing && hasAvatar && (
            <div className="user-profile-avatar-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={removeAvatar}
                disabled={isSubmitting || isUploadingImage}
                size="small"
              >
                Удалить фото
              </Button>
            </div>
          )}
        </div>

        <div className="user-profile-main">
           <div className="user-profile-tabs">
            <button className={`user-profile-tab ${activeTab === 'main' ? 'active' : ''}`} onClick={() => setActiveTab('main')}>
              Основная
            </button>
            <button className={`user-profile-tab ${activeTab === 'work' ? 'active' : ''}`} onClick={() => setActiveTab('work')}>
              Рабочая
            </button>
            {!isEditing && (
              <button className={`user-profile-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
                Статистика
              </button>
            )}
          </div>

          <div className="user-profile-tab-content">
            {isEditing ? (
              <form id="user-profile-form" onSubmit={handleSubmit} className="user-profile-form" noValidate>
                <div className={`user-profile-section ${activeTab === 'main' ? 'active' : ''}`}>
                    <h3 className="user-profile-section-title">Основная информация</h3>
                    <div className="user-profile-row">
                      <div className="user-profile-group">
                        <label htmlFor="name" className="user-profile-label">
                          Полное имя <span className="required">*</span>
                        </label>
                        <input
                          id="name"
                          type="text"
                          className={`user-profile-input ${errors.name ? 'error' : ''}`}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={isSubmitting}
                          required
                          placeholder="Иван Иванов"
                          maxLength={50}
                        />
                        {errors.name && <p className="user-profile-error">{errors.name}</p>}
                      </div>

                      <div className="user-profile-group">
                        <label htmlFor="email" className="user-profile-label">
                          Email адрес <span className="required">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={`user-profile-input ${errors.email ? 'error' : ''}`}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isSubmitting}
                          required
                          placeholder="ivan.ivanov@example.com"
                        />
                        {errors.email && <p className="user-profile-error">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="user-profile-group">
                      <label htmlFor="bio" className="user-profile-label">О себе</label>
                      <textarea
                        id="bio"
                        className={`user-profile-textarea ${errors.bio ? 'error' : ''}`}
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Расскажите о себе..."
                        rows={3}
                        disabled={isSubmitting}
                        maxLength={500}
                      />
                      <div className="user-profile-char-count">
                        {formData.bio.length}/500
                      </div>
                      {errors.bio && <p className="user-profile-error">{errors.bio}</p>}
                    </div>
                  </div>
                <div className={`user-profile-section ${activeTab === 'work' ? 'active' : ''}`}>
                    <h3 className="user-profile-section-title">Рабочая информация</h3>
                    <div className="user-profile-row">
                      <div className="user-profile-group">
                        <label htmlFor="department" className="user-profile-label">Отдел</label>
                        <input
                          id="department"
                          type="text"
                          className={`user-profile-input ${errors.department ? 'error' : ''}`}
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Разработка"
                          maxLength={100}
                        />
                        {errors.department && <p className="user-profile-error">{errors.department}</p>}
                      </div>

                      <div className="user-profile-group">
                        <label htmlFor="position" className="user-profile-label">Должность</label>
                        <input
                          id="position"
                          type="text"
                          className={`user-profile-input ${errors.position ? 'error' : ''}`}
                          value={formData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Frontend разработчик"
                          maxLength={100}
                        />
                        {errors.position && <p className="user-profile-error">{errors.position}</p>}
                      </div>
                    </div>

                    <div className="user-profile-group">
                      <label htmlFor="phone" className="user-profile-label">Телефон</label>
                      <input
                        id="phone"
                        type="tel"
                        className={`user-profile-input ${errors.phone ? 'error' : ''}`}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={isSubmitting}
                        placeholder="+7 999 123-45-67"
                      />
                      {errors.phone && <p className="user-profile-error">{errors.phone}</p>}
                    </div>
                  </div>

                {errors.submit && (
                  <div className="user-profile-error-message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {errors.submit}
                  </div>
                )}
              </form>
            ) : (
              <div className="user-profile-view-mode">
                <div className={`user-profile-section ${activeTab === 'main' ? 'active' : ''}`}>
                    <h3 className="user-profile-section-title">Основная информация</h3>
                    <div className="user-profile-row">
                      <ProfileField label="Полное имя" value={user.name} />
                      <ProfileField label="Email адрес" value={user.email} />
                    </div>
                    <ProfileField label="О себе" value={user.bio} isBio />
                  </div>

                <div className={`user-profile-section ${activeTab === 'work' ? 'active' : ''}`}>
                    <h3 className="user-profile-section-title">Рабочая информация</h3>
                    <div className="user-profile-row">
                      <ProfileField label="Отдел" value={user.department} />
                      <ProfileField label="Должность" value={user.position} />
                    </div>
                    <ProfileField label="Телефон" value={user.phone} />
                  </div>

                <section className={`user-profile-section ${activeTab === 'stats' ? 'active' : ''}`}>
                    <h3 className="user-profile-section-title">Статистика</h3>
                    <div className="user-profile-stats">
                      <div className="user-profile-stat-card">
                        <div className="user-profile-stat-value">{stats.tasksCompleted || 0}</div>
                        <div className="user-profile-stat-label">Задач выполнено</div>
                      </div>
                      <div className="user-profile-stat-card">
                        <div className="user-profile-stat-value">{stats.tasksInProgress || 0}</div>
                        <div className="user-profile-stat-label">Задач в работе</div>
                      </div>
                      <div className="user-profile-stat-card">
                        <div className="user-profile-stat-value">{stats.totalTasks || 0}</div>
                        <div className="user-profile-stat-label">Всего задач</div>
                      </div>
                    </div>
                  </section>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="user-profile-footer">
        {isEditing ? (
          <div className="user-profile-edit-actions">
            <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>Отмена</Button>
            <Button type="submit" form="user-profile-form" variant="primary" isLoading={isSubmitting}>Сохранить</Button>
          </div>
        ) : (
          <Button variant="destructive" onClick={handleLogout} isLoading={isSubmitting}>
            Выйти
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
