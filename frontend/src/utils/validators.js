// utils/validators.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      minLength: password.length < minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers
    }
  };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} обязательно для заполнения`;
  }
  return null;
};

export const validateTaskTitle = (title) => {
  const minLength = 3;
  const maxLength = 100;

  if (!title || title.trim() === '') {
    return 'Название задачи обязательно';
  }

  if (title.length < minLength) {
    return `Название должно содержать минимум ${minLength} символа`;
  }

  if (title.length > maxLength) {
    return `Название не должно превышать ${maxLength} символов`;
  }

  return null;
};

export const validateTaskDescription = (description) => {
  const maxLength = 500;

  if (description && description.length > maxLength) {
    return `Описание не должно превышать ${maxLength} символов`;
  }

  return null;
};

export const validateDate = (date) => {
  if (!date) return null;

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return 'Дата не может быть в прошлом';
  }

  return null;
};

export const validatePriority = (priority) => {
  const validPriorities = ['low', 'medium', 'high'];

  if (!validPriorities.includes(priority)) {
    return 'Недопустимый приоритет';
  }

  return null;
};

export const validateStatus = (status) => {
  const validStatuses = ['todo', 'in-progress', 'review', 'done'];

  if (!validStatuses.includes(status)) {
    return 'Недопустимый статус';
  }

  return null;
};

export const validateAssignee = (assignee) => {
  if (!assignee) return null;

  if (typeof assignee !== 'object' || !assignee.id || !assignee.name) {
    return 'Недопустимый исполнитель';
  }

  return null;
};

export const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    return 'Теги должны быть массивом';
  }

  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.trim() === '') {
      return 'Каждый тег должен быть непустой строкой';
    }

    if (tag.length > 20) {
      return 'Тег не должен превышать 20 символов';
    }
  }

  if (tags.length > 10) {
    return 'Максимум 10 тегов';
  }

  return null;
};

export const validateTask = (task) => {
  const errors = {};

  const titleError = validateTaskTitle(task.title);
  if (titleError) errors.title = titleError;

  const descriptionError = validateTaskDescription(task.description);
  if (descriptionError) errors.description = descriptionError;

  const dateError = validateDate(task.dueDate);
  if (dateError) errors.dueDate = dateError;

  const priorityError = validatePriority(task.priority);
  if (priorityError) errors.priority = priorityError;

  const statusError = validateStatus(task.status);
  if (statusError) errors.status = statusError;

  const assigneeError = validateAssignee(task.assignee);
  if (assigneeError) errors.assignee = assigneeError;

  const tagsError = validateTags(task.tags || []);
  if (tagsError) errors.tags = tagsError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUserProfile = (profile) => {
  const errors = {};

  if (!profile.name || profile.name.trim() === '') {
    errors.name = 'Имя обязательно для заполнения';
  } else if (profile.name.length < 2) {
    errors.name = 'Имя должно содержать минимум 2 символа';
  } else if (profile.name.length > 50) {
    errors.name = 'Имя не должно превышать 50 символов';
  }

  if (profile.email) {
    if (!validateEmail(profile.email)) {
      errors.email = 'Некорректный email адрес';
    }
  }

  if (profile.bio && profile.bio.length > 200) {
    errors.bio = 'Биография не должна превышать 200 символов';
  }

  if (profile.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(profile.phone.replace(/\s/g, ''))) {
      errors.phone = 'Некорректный номер телефона';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateSearchQuery = (query) => {
  if (!query || query.trim() === '') {
    return 'Поисковый запрос не может быть пустым';
  }

  if (query.length < 2) {
    return 'Поисковый запрос должен содержать минимум 2 символа';
  }

  if (query.length > 100) {
    return 'Поисковый запрос не должен превышать 100 символов';
  }

  return null;
};
