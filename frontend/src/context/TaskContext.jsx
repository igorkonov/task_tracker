import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { tasksAPI as taskService, usersAPI } from '../services/api.js';
import { useAuthContext } from './AuthContext.jsx';

// Начальное состояние
const initialState = {
  tasks: [],
  filteredTasks: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    assignee: 'all',
    dueDate: 'all',
    tags: [],
    search: ''
  },
  sortBy: 'created_at',
  sortOrder: 'desc',
  selectedTasks: [],
  draggedTask: null,
  columns: {
    todo: { title: 'To Do', color: '#3b82f6', tasks: [] },
    inProgress: { title: 'In Progress', color: '#f59e0b', tasks: [] },
    review: { title: 'Review', color: '#8b5cf6', tasks: [] },
    done: { title: 'Done', color: '#10b981', tasks: [] }
  }
};

// Типы действий
const TASK_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SET_SELECTED_TASKS: 'SET_SELECTED_TASKS',
  SET_DRAGGED_TASK: 'SET_DRAGGED_TASK',
  MOVE_TASK: 'MOVE_TASK',
  BULK_UPDATE_TASKS: 'BULK_UPDATE_TASKS',
  FILTER_TASKS: 'FILTER_TASKS'
};

// Reducer
const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case TASK_ACTIONS.SET_ERROR:
      return { ...state, loading: false, error: action.payload };

    case TASK_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case TASK_ACTIONS.SET_TASKS: {
      console.log("SET_TASKS payload:", action.payload);
      const tasks = action.payload || [];
      const columns = {
        todo: { ...initialState.columns.todo, tasks: [] },
        inProgress: { ...initialState.columns.inProgress, tasks: [] },
        review: { ...initialState.columns.review, tasks: [] },
        done: { ...initialState.columns.done, tasks: [] },
      };

      tasks.forEach(task => {
        const status = task.status || 'todo';
        if (columns[status]) {
          columns[status].tasks.push(task);
        } else {
          // Если у задачи неизвестный статус, помещаем ее в 'todo'
          columns.todo.tasks.push(task);
        }
      });

      console.log("SET_TASKS resulting columns:", columns);

      return {
        ...state,
        tasks: tasks,
        columns: columns,
        loading: false,
        error: null,
      };
    }

    case TASK_ACTIONS.ADD_TASK:
      const newTask = action.payload;
      const newTaskColumn = newTask.status || 'todo';

      return {
        ...state,
        tasks: [...state.tasks, newTask],
        columns: {
          ...state.columns,
          [newTaskColumn]: {
            ...state.columns[newTaskColumn],
            tasks: [...state.columns[newTaskColumn].tasks, newTask]
          }
        }
      };

    case TASK_ACTIONS.UPDATE_TASK:
      const updatedTask = action.payload;
      const oldTaskIndex = state.tasks.findIndex(task => task.id === updatedTask.id);
      const oldTask = state.tasks[oldTaskIndex];
      const oldStatus = oldTask?.status || 'todo';
      const newStatus = updatedTask.status || 'todo';

      const updatedTasks = [...state.tasks];
      updatedTasks[oldTaskIndex] = updatedTask;

      let updatedColumns = { ...state.columns };

      // Если статус изменился, перемещаем задачу между колонками
      if (oldStatus !== newStatus) {
        updatedColumns[oldStatus].tasks = updatedColumns[oldStatus].tasks.filter(
          task => task.id !== updatedTask.id
        );
        updatedColumns[newStatus].tasks = [...updatedColumns[newStatus].tasks, updatedTask];
      } else {
        // Обновляем задачу в той же колонке
        updatedColumns[newStatus].tasks = updatedColumns[newStatus].tasks.map(
          task => task.id === updatedTask.id ? updatedTask : task
        );
      }

      return {
        ...state,
        tasks: updatedTasks,
        columns: updatedColumns
      };

    case TASK_ACTIONS.DELETE_TASK:
      const taskToDelete = state.tasks.find(task => task.id === action.payload);
      const deleteStatus = taskToDelete?.status || 'todo';

      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        columns: {
          ...state.columns,
          [deleteStatus]: {
            ...state.columns[deleteStatus],
            tasks: state.columns[deleteStatus].tasks.filter(task => task.id !== action.payload)
          }
        },
        selectedTasks: state.selectedTasks.filter(id => id !== action.payload)
      };

    case TASK_ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case TASK_ACTIONS.SET_SORT:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };

    case TASK_ACTIONS.SET_SELECTED_TASKS:
      return { ...state, selectedTasks: action.payload };

    case TASK_ACTIONS.SET_DRAGGED_TASK:
      return { ...state, draggedTask: action.payload };

    case TASK_ACTIONS.MOVE_TASK:
      const { taskId, sourceColumn, targetColumn, sourceIndex, targetIndex } = action.payload;
      const taskToMove = state.columns[sourceColumn].tasks[sourceIndex];

      if (!taskToMove) return state;

      const updatedTaskToMove = { ...taskToMove, status: targetColumn };
      const newColumns = { ...state.columns };

      // Удаляем из исходной колонки
      newColumns[sourceColumn] = {
        ...newColumns[sourceColumn],
        tasks: newColumns[sourceColumn].tasks.filter((_, index) => index !== sourceIndex)
      };

      // Добавляем в целевую колонку
      const targetTasks = [...newColumns[targetColumn].tasks];
      targetTasks.splice(targetIndex, 0, updatedTaskToMove);
      newColumns[targetColumn] = {
        ...newColumns[targetColumn],
        tasks: targetTasks
      };

      // Обновляем общий список задач
      const updatedAllTasks = state.tasks.map(task =>
        task.id === taskId ? updatedTaskToMove : task
      );

      return {
        ...state,
        tasks: updatedAllTasks,
        columns: newColumns
      };

    case TASK_ACTIONS.BULK_UPDATE_TASKS:
      const { taskIds, updates } = action.payload;
      const bulkUpdatedTasks = state.tasks.map(task =>
        taskIds.includes(task.id) ? { ...task, ...updates } : task
      );

      // Пересчитываем колонки
      const recomputedColumns = {
        todo: { ...state.columns.todo, tasks: [] },
        inProgress: { ...state.columns.inProgress, tasks: [] },
        review: { ...state.columns.review, tasks: [] },
        done: { ...state.columns.done, tasks: [] }
      };

      bulkUpdatedTasks.forEach(task => {
        const column = task.status || 'todo';
        if (recomputedColumns[column]) {
          recomputedColumns[column].tasks.push(task);
        }
      });

      return {
        ...state,
        tasks: bulkUpdatedTasks,
        columns: recomputedColumns
      };

    case TASK_ACTIONS.FILTER_TASKS:
      return { ...state, filteredTasks: action.payload };

    default:
      return state;
  }
};

// Создание контекста
const TaskContext = createContext();

// Провайдер контекста
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { isAuthenticated, user } = useAuthContext();
  const [users, setUsers] = React.useState([]);

  // Загрузка пользователей
  useEffect(() => {
    usersAPI.getUsers().then(setUsers);
  }, []);

  // Загрузка задач
  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;

    dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });

    try {
      const tasks = await taskService.getTasks();
      dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: tasks });
    } catch (error) {
      dispatch({
        type: TASK_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to load tasks'
      });
    }
  }, [isAuthenticated]);

  // Создание задачи
  const createTask = useCallback(async (taskData) => {
    try {
      const newTask = await taskService.createTask({
        ...taskData,
        created_by: user?.id,
        created_at: new Date().toISOString()
      });

      dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: newTask });
      return { success: true, task: newTask };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Обновление задачи
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, taskData);
      dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: updatedTask });
      return { success: true, task: updatedTask };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Удаление задачи
  const deleteTask = useCallback(async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: taskId });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Перемещение задачи между колонками
  const moveTask = useCallback(async (taskId, sourceColumn, targetColumn, sourceIndex, targetIndex) => {
    // Оптимистическое обновление UI
    dispatch({
      type: TASK_ACTIONS.MOVE_TASK,
      payload: { taskId, sourceColumn, targetColumn, sourceIndex, targetIndex }
    });

    try {
      await taskService.updateTask(taskId, {
        status: targetColumn,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      // Откатываем изменения при ошибке
      dispatch({
        type: TASK_ACTIONS.MOVE_TASK,
        payload: { taskId, sourceColumn: targetColumn, targetColumn: sourceColumn, sourceIndex: targetIndex, targetIndex: sourceIndex }
      });

      dispatch({
        type: TASK_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to move task'
      });
    }
  }, []);

  // Массовое обновление задач
  const bulkUpdateTasks = useCallback(async (taskIds, updates) => {
    try {
      await taskService.bulkUpdateTasks(taskIds, updates);
      dispatch({
        type: TASK_ACTIONS.BULK_UPDATE_TASKS,
        payload: { taskIds, updates }
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update tasks';
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Фильтрация задач
  const filterTasks = useCallback(() => {
    let filtered = [...state.tasks];

    // Фильтр по статусу
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === state.filters.status);
    }

    // Фильтр по приоритету
    if (state.filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === state.filters.priority);
    }

    // Фильтр по исполнителю
    if (state.filters.assignee !== 'all') {
      filtered = filtered.filter(task => task.assignee_id === state.filters.assignee);
    }

    // Фильтр по тегам
    if (state.filters.tags.length > 0) {
      filtered = filtered.filter(task =>
        task.tags && task.tags.some(tag => state.filters.tags.includes(tag.id))
      );
    }

    // Поиск по тексту
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по дате выполнения
    if (state.filters.dueDate !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(task => {
        if (!task.due_date) return state.filters.dueDate === 'no_due_date';

        const dueDate = new Date(task.due_date);

        switch (state.filters.dueDate) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate >= today && dueDate < tomorrow;
          case 'this_week':
            return dueDate >= today && dueDate < nextWeek;
          case 'no_due_date':
            return false;
          default:
            return true;
        }
      });
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue = a[state.sortBy];
      let bValue = b[state.sortBy];

      if (state.sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      }

      if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    dispatch({ type: TASK_ACTIONS.FILTER_TASKS, payload: filtered });
  }, [state.tasks, state.filters, state.sortBy, state.sortOrder]);

  // Установка фильтров
  const setFilters = useCallback((filters) => {
    dispatch({ type: TASK_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  // Установка сортировки
  const setSort = useCallback((sortBy, sortOrder) => {
    dispatch({ type: TASK_ACTIONS.SET_SORT, payload: { sortBy, sortOrder } });
  }, []);

  // Выбор задач
  const setSelectedTasks = useCallback((taskIds) => {
    dispatch({ type: TASK_ACTIONS.SET_SELECTED_TASKS, payload: taskIds });
  }, []);

  // Очистка ошибки
  const clearError = useCallback(() => {
    dispatch({ type: TASK_ACTIONS.CLEAR_ERROR });
  }, []);

  // Загрузка задач при монтировании
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Фильтрация при изменении фильтров
  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const value = {
    // State
    tasks: state.tasks,
    filteredTasks: state.filteredTasks,
    columns: state.columns,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    selectedTasks: state.selectedTasks,
    draggedTask: state.draggedTask,
    users,

    // Actions
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    bulkUpdateTasks,
    setFilters,
    setSort,
    setSelectedTasks,
    clearError
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

// Хук для использования контекста
export const useTaskContext = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }

  return context;
};
