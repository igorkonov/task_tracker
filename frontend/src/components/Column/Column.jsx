import React from 'react';
import './Column.css';
import TaskCard from '../TaskCard/TaskCard';

const statusLabels = {
  todo: 'К выполнению',
  inprogress: 'В процессе',
  review: 'На проверке',
  done: 'Готово'
};
const columnColors = {
  todo: '#ff4757',
  inprogress: '#ffa502',
  review: '#3742fa',
  done: '#2ed573'
};

const Column = ({ title, tasks, status, onTaskDrop, onAddTask, onEditTask, onDeleteTask }) => {
  const color = columnColors[status] || '#fff';
  const label = statusLabels[status] || title;

  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onTaskDrop(taskId, status);
  };

  return (
    <div className="kanban-column" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="column-header">
        <div className="column-title">
          <span className="column-dot" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
          <h2>{label}</h2>
        </div>
        <div className="column-actions">
          <span className="task-count">{tasks.length}</span>
          <button
            className="add-task-btn shimmer-effect"
            onClick={onAddTask}
          >
            +
          </button>
        </div>
      </div>
      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-column">
            <div className="empty-icon">🗂️</div>
            <p className="empty-text">Задач пока нет</p>
            <button className="empty-add-btn shimmer-effect" onClick={onAddTask}>Добавить задачу</button>
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('text/plain', task.id);
                e.currentTarget.classList.add('dragging');
              }}
              onDragEnd={e => {
                e.currentTarget.classList.remove('dragging');
              }}
              style={{ animationDelay: `${index * 100}ms` }}
              className="slide-in"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Column;
