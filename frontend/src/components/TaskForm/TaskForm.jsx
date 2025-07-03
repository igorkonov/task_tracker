import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useAuthContext } from '../../context/AuthContext.jsx';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import Avatar from '../Avatar/Avatar';
import './TaskForm.css';

const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

const TaskForm = ({ task, isOpen, onSave, onCancel, defaultStatus = 'todo' }) => {
  const { createTask, updateTask, users, loadTasks } = useTaskContext();
  const { user } = useAuthContext();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: PRIORITY.MEDIUM,
    assignee: '',
    tags: '',
    dueDate: '',
    status: defaultStatus
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagList, setTagList] = useState([]);

  useEffect(() => {
    if (task) {
      const tags = Array.isArray(task.tags) ? task.tags : (task.tags ? task.tags.split(', ') : []);
      setFormData({
        ...task,
        tags: '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        status: task.status || 'todo'
      });
      setTagList(tags);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: PRIORITY.MEDIUM,
        assignee: '',
        tags: '',
        dueDate: '',
        status: defaultStatus
      });
      setTagList([]);
    }
  }, [task, defaultStatus]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название задачи обязательно';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание задачи обязательно';
    }

    if (!formData.assignee.trim()) {
      newErrors.assignee = 'Исполнитель обязателен';
    }

    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
      newErrors.dueDate = 'Дата выполнения не может быть в прошлом';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Добавляем последний введенный тег, если он есть
    const finalTagList = [...tagList];
    const pendingTag = formData.tags.trim();
    if (pendingTag && !finalTagList.includes(pendingTag)) {
      finalTagList.push(pendingTag);
    }

    try {
      const { tags, ...restOfFormData } = formData;
      const taskData = {
        ...restOfFormData,
        tags: finalTagList, // Используем обновленный список тегов
        assignee: formData.assignee,
        createdBy: user?.id,
        updatedAt: new Date().toISOString(),
        id: task?.id || Date.now().toString()
      };

      console.log('TaskForm: Submitting task data:', taskData);

      let result;
      if (task) {
        result = await updateTask(task.id, taskData);
        console.log('TaskForm: Task updated successfully:', result);
      } else {
        result = await createTask(taskData);
        console.log('TaskForm: Task created successfully:', result);

        setFormData({
          title: '',
          description: '',
          priority: PRIORITY.MEDIUM,
          assignee: '',
          tags: '',
          dueDate: '',
          status: defaultStatus
        });
        setTagList([]);
      }

      setTimeout(() => {
        onSave();
      }, 100);

    } catch (error) {
      console.error('TaskForm: Error saving task:', error);
      alert('Ошибка при сохранении задачи: ' + (error?.message || error));
      setErrors({ submit: 'Ошибка при сохранении задачи' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = formData.tags.trim();
      if (tag && !tagList.includes(tag)) {
        setTagList(prev => [...prev, tag]);
        setFormData(prev => ({ ...prev, tags: '' }));
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTagList(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--error-color)';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--accent-color)';
    }
  };

  if (!isOpen) return null;
  if (typeof onSave !== 'function' || typeof onCancel !== 'function') return null;

  return (
    <div className="task-form-overlay" onMouseDown={onCancel}>
      <div className="task-form-container" onMouseDown={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <h2 className="task-form-title">
            {task ? 'Редактировать задачу' : 'Новая задача'}
          </h2>
          <button
            className="task-form-close shimmer-effect"
            onClick={onCancel}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="task-form-section">
            <div className="task-form-group">
              <label className="task-form-label">Название задачи *</label>
            <input
              type="text"
                value={formData.title || ''}
              onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Введите название задачи..."
              required
            />
          </div>

            <div className="task-form-group">
              <label className="task-form-label">Описание *</label>
            <textarea
                className="task-form-textarea"
                value={formData.description || ''}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Опишите задачу подробнее..."
                rows={4}
                required
              />
            </div>
          </div>

          <div className="task-form-section">
            <div className="task-form-row">
              <div className="task-form-group">
                <label className="task-form-label">Исполнитель *</label>
                <input
                  type="text"
                  value={formData.assignee || ''}
                  onChange={e => handleInputChange('assignee', e.target.value)}
                  placeholder="Имя исполнителя"
                  required
                />
              </div>

              <div className="task-form-group">
                <label className="task-form-label">Приоритет</label>
              <select
                  className="task-form-select"
                  value={formData.priority || ''}
                onChange={e => handleInputChange('priority', e.target.value)}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>
          </div>

          <div className="task-form-section">
            <div className="task-form-row">
              <div className="task-form-group">
                <label className="task-form-label">Срок выполнения</label>
              <input
                type="date"
                  value={formData.dueDate || ''}
                onChange={e => handleInputChange('dueDate', e.target.value)}
              />
              </div>

              <div className="task-form-group">
                <label className="task-form-label">Статус</label>
                <select
                  className="task-form-select"
                  value={formData.status || defaultStatus}
                  onChange={e => handleInputChange('status', e.target.value)}
                >
                  <option value="todo">К выполнению</option>
                  <option value="inprogress">В процессе</option>
                  <option value="review">На проверке</option>
                  <option value="done">Готово</option>
                </select>
              </div>
            </div>
          </div>

          <div className="task-form-section">
            <div className="task-form-group">
              <label className="task-form-label">Теги</label>
              <div className="task-form-tags-input">
                <Input
                type="text"
                  value={formData.tags || ''}
                onChange={e => handleInputChange('tags', e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Backend, Frontend, Docs..."
                />
                {tagList.length > 0 && (
                  <div className="task-form-tags-list">
                    {tagList.map((tag, index) => (
                      <div key={index} className="task-form-tag">
                        <span>{tag}</span>
                        <button
                          type="button"
                          className="task-form-tag-remove"
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="task-form-error-message">
              {errors.submit}
            </div>
          )}

          <div className="task-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="shimmer-effect"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="shimmer-effect btn-primary"
            >
              {task ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
