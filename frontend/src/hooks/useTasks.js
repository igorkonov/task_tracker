import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка задач
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksAPI.getTasks();
      console.log('useTasks: Fetched tasks from API:', data);
      setTasks(data || []);
      console.log('useTasks: Tasks state updated, count:', data?.length || 0);
    } catch (err) {
      setError(err.message);
      console.error('useTasks: Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание новой задачи
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('useTasks: Creating task with data:', taskData);
      const newTask = await tasksAPI.createTask(taskData);
      console.log('useTasks: Task created successfully:', newTask);

      // Обновляем состояние задач немедленно
      setTasks(prev => {
        const updated = [...prev, newTask];
        console.log('useTasks: Tasks state updated after create, new count:', updated.length);
        console.log('useTasks: New task added:', newTask);
        return updated;
      });

      return newTask;
    } catch (err) {
      setError(err.message);
      console.error('useTasks: Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление задачи
  const updateTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('useTasks: Updating task:', taskId, taskData);
      const updatedTask = await tasksAPI.updateTask(taskId, taskData);
      console.log('useTasks: Task updated successfully:', updatedTask);

      // Обновляем состояние задач немедленно
      setTasks(prev => {
        const updated = prev.map(task =>
          task.id === taskId ? updatedTask : task
        );
        console.log('useTasks: Tasks state updated after edit, count:', updated.length);
        return updated;
      });

      return updatedTask;
    } catch (err) {
      setError(err.message);
      console.error('useTasks: Error updating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление задачи
  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('useTasks: Deleting task:', taskId);
      await tasksAPI.deleteTask(taskId);

      // Обновляем состояние задач немедленно
      setTasks(prev => {
        const updated = prev.filter(task => task.id !== taskId);
        console.log('useTasks: Tasks state updated after delete, count:', updated.length);
        return updated;
      });
    } catch (err) {
      setError(err.message);
      console.error('useTasks: Error deleting task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Изменение статуса задачи
  const updateTaskStatus = useCallback(async (taskId, status) => {
    try {
      const updatedTask = await updateTask(taskId, { status });
      return updatedTask;
    } catch (err) {
      throw err;
    }
  }, [updateTask]);

  // Изменение приоритета задачи
  const updateTaskPriority = useCallback(async (taskId, priority) => {
    try {
      const updatedTask = await updateTask(taskId, { priority });
      return updatedTask;
    } catch (err) {
      throw err;
    }
  }, [updateTask]);

  // Назначение исполнителя
  const assignTask = useCallback(async (taskId, assigneeId) => {
    try {
      const updatedTask = await updateTask(taskId, { assignee_id: assigneeId });
      return updatedTask;
    } catch (err) {
      throw err;
    }
  }, [updateTask]);

  // Добавление комментария к задаче
  const addComment = useCallback(async (taskId, comment) => {
    setError(null);
    try {
      // Since we're using mocks, we'll just update the task locally
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          comments: [...(task.comments || []), { id: Date.now().toString(), text: comment, createdAt: new Date().toISOString() }]
        };
        await updateTask(taskId, updatedTask);
        return updatedTask;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [tasks, updateTask]);

  // Получение задач по статусу
  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  // Получение задач по приоритету
  const getTasksByPriority = useCallback((priority) => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  // Получение просроченных задач
  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter(task =>
      task.due_date &&
      new Date(task.due_date) < now &&
      task.status !== 'done'
    );
  }, [tasks]);

  // Получение задач на сегодня
  const getTodayTasks = useCallback(() => {
    const today = new Date().toDateString();
    return tasks.filter(task =>
      task.due_date &&
      new Date(task.due_date).toDateString() === today
    );
  }, [tasks]);

  // Статистика задач
  const getTaskStats = useCallback(() => {
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inprogress: tasks.filter(t => t.status === 'inprogress').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: getOverdueTasks().length,
      today: getTodayTasks().length,
      byPriority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
      }
    };
    return stats;
  }, [tasks, getOverdueTasks, getTodayTasks]);

  // Поиск задач
  const searchTasks = useCallback((query) => {
    if (!query) return tasks;

    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      (task.tags && task.tags.some(tag =>
        tag.toLowerCase().includes(lowercaseQuery)
      ))
    );
  }, [tasks]);

  // Фильтрация задач
  const filterTasks = useCallback((filters) => {
    let filteredTasks = [...tasks];

    if (filters.status && filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    if (filters.assignee && filters.assignee !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.assignee_id === filters.assignee);
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        task.tags && task.tags.some(tag => filters.tags.includes(tag))
      );
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filteredTasks = filteredTasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate >= start && taskDate <= end;
      });
    }

    return filteredTasks;
  }, [tasks]);

  // Сортировка задач
  const sortTasks = useCallback((tasksToSort, sortBy = 'created_at', sortOrder = 'desc') => {
    const sorted = [...tasksToSort].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Специальная обработка для дат
      if (sortBy === 'due_date' || sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }

      // Специальная обработка для приоритета
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, []);

  // Принудительное обновление задач (для использования в Dashboard)
  const refreshTasks = useCallback(async () => {
    console.log('Refreshing tasks...');
    await fetchTasks();
  }, [fetchTasks]);

  // Загрузка задач при монтировании компонента
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    // Состояние
    tasks,
    loading,
    error,

    // Основные операции CRUD
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks, // Добавляем refreshTasks

    // Специальные операции
    updateTaskStatus,
    updateTaskPriority,
    assignTask,
    addComment,

    // Фильтрация и поиск
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
    getTodayTasks,
    searchTasks,
    filterTasks,
    sortTasks,

    // Статистика
    getTaskStats
  };
};
