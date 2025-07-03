import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Dashboard.css';
import TaskCard from '../../components/TaskCard/TaskCard';
import TaskForm from '../../components/TaskForm/TaskForm';
import Column from '../../components/Column/Column';
import UserProfile from '../../components/UserProfile/UserProfile';
import AIAssistant from '../../components/AIAssistant/AIAssistant';
import ThemeSwitcher from '../../components/ThemeSwitcher/ThemeSwitcher';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = ({ onLogout }) => {
  const { tasks, loading, createTask, updateTask, deleteTask, refreshTasks } = useTasks();
  const { user } = useAuth();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);

  // Пересчитываем колонки на каждом рендере для получения актуальных данных
  const columns = [
    { id: 'todo', title: 'To Do', color: '#ff6b6b', tasks: tasks.filter(task => task.status === 'todo') },
    { id: 'inprogress', title: 'In Progress', color: '#4ecdc4', tasks: tasks.filter(task => task.status === 'inprogress') },
    { id: 'review', title: 'Review', color: '#45b7d1', tasks: tasks.filter(task => task.status === 'review') },
    { id: 'done', title: 'Done', color: '#96ceb4', tasks: tasks.filter(task => task.status === 'done') }
  ];

  const handleTaskDrop = async (taskId, newStatus) => {
    try {
      // Находим полную задачу
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) {
        console.error('Dashboard: Task not found for dropping:', taskId);
        return;
      }

      // Обновляем задачу, сохраняя все ее данные
      console.log('Dashboard: Dropping task', taskId, 'to status', newStatus);
      await updateTask(taskId, { ...taskToUpdate, status: newStatus });
      console.log('Dashboard: Task status updated successfully');
    } catch (error) {
      console.error('Dashboard: Error updating task status:', error);
    }
  };

  const handleAddTask = (columnId) => {
    console.log('Dashboard: Adding task to column', columnId);
    setSelectedColumn(columnId);
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task) => {
    console.log('Dashboard: Editing task', task.id);
    setEditingTask(task);
    setSelectedColumn(task.status);
    setIsTaskFormOpen(true);
  };

  // Исправленная функция handleTaskSubmit
  const handleTaskSubmit = async () => {
    console.log('Dashboard: Task submitted, refreshing tasks');

    // Закрываем форму
    setIsTaskFormOpen(false);
    setSelectedColumn(null);
        setEditingTask(null);

    // Принудительно обновляем список задач
    try {
      await refreshTasks();
      console.log('Dashboard: Tasks refreshed successfully');
    } catch (error) {
      console.error('Dashboard: Error refreshing tasks:', error);
      }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      console.log('Dashboard: Deleting task', taskId);
      await deleteTask(taskId);
      console.log('Dashboard: Task deleted successfully');
    } catch (error) {
      console.error('Dashboard: Error deleting task:', error);
    }
  };

  // Загружаем задачи при монтировании компонента
  useEffect(() => {
    console.log('Dashboard: Component mounted, tasks count:', tasks.length);
  }, [tasks]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">TT</div>
            <h1>Task Tracker</h1>
          </div>

          <div className="dashboard-header-actions">
            <button
              onClick={() => setIsAIOpen(true)}
              className="ai-button header-btn"
            >
              <span className="ai-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ai-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.75L10.7375 8.25L5.25 9.5125L9.5125 13.775L8.25 19.25L12 16.35L15.75 19.25L14.4875 13.775L18.75 9.5125L13.2625 8.25L12 2.75Z" stroke="url(#ai-icon-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.25 2.75L4.5375 4.925L2.3625 5.6375L4.5375 6.35L5.25 8.5125L5.9625 6.35L8.1375 5.6375L5.9625 4.925L5.25 2.75Z" stroke="url(#ai-icon-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.75 15.75L18.0375 17.925L15.8625 18.6375L18.0375 19.35L18.75 21.5125L19.4625 19.35L21.6375 18.6375L19.4625 17.925L18.75 15.75Z" stroke="url(#ai-icon-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              AI Assistant
            </button>

            <ThemeSwitcher className="header-btn" />

            <button
                onClick={() => setIsProfileOpen(true)}
              className="user-button header-btn"
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span>{user?.name || 'User'}</span>
            </button>
          </div>
        </div>

        {/* Добавим отладочную информацию */}
        <div style={{ fontSize: '12px', color: '#666', padding: '5px' }}>
          Всего задач: {tasks.length} |
          Todo: {columns[0].tasks.length} |
          In Progress: {columns[1].tasks.length} |
          Review: {columns[2].tasks.length} |
          Done: {columns[3].tasks.length}
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-columns">
          {columns.map((column) => (
            <Column
              key={column.id}
              title={column.title}
              tasks={column.tasks}
              status={column.id}
              onTaskDrop={handleTaskDrop}
              onAddTask={() => handleAddTask(column.id)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </main>

      {/* TaskForm */}
        <TaskForm
          task={editingTask}
          isOpen={isTaskFormOpen}
        defaultStatus={selectedColumn || 'todo'}
          onSave={handleTaskSubmit}
        onCancel={() => {
          console.log('Dashboard: Task form cancelled');
          setIsTaskFormOpen(false);
          setEditingTask(null);
          setSelectedColumn(null);
        }}
        />

      {/* Modals */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Настройки профиля"
        className="user-profile-modal"
        size="large"
      >
        <UserProfile onLogout={onLogout} />
      </Modal>

      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onTaskCreate={createTask}
        currentTasks={tasks}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
