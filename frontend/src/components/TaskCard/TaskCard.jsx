import React, { useState, useRef, useEffect } from 'react';
import Avatar from '../Avatar/Avatar';
import './TaskCard.css';

const priorityColors = {
  low: '#2ed573',
  medium: '#ffa502',
  high: '#ff4757'
};

const priorityLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
};

const tagColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#A8E6CF'];

const TaskCard = ({ task, onEdit, onDelete, draggable = false, onDragStart, onDragEnd }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close menu if clicking outside of it
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div
      className={`task-card ${showMenu ? 'menu-open' : ''}`}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
          <div className="task-menu">
            <button className="menu-button" onClick={() => setShowMenu(!showMenu)}>⋮</button>
            {showMenu && (
            <div className="menu-dropdown" ref={menuRef}>
              <button onClick={() => { onEdit(task); setShowMenu(false); }}>
                <span role="img" aria-label="edit">✏️</span>
                Редактировать
              </button>
              <button
                className="delete-btn"
                onClick={() => { onDelete(task.id); setShowMenu(false); }}
              >
                <span role="img" aria-label="delete">🗑️</span>
                Удалить
              </button>
              </div>
            )}
          </div>
        </div>
      <p className="task-description">{task.description}</p>
        <div className="task-tags">
          {task.tags && task.tags.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
        <div className="task-footer">
          <div className="assignee">
          <Avatar user={{ name: task.assignee }} />
            <span>{task.assignee}</span>
          </div>
          <div className="task-info">
            <span className={`priority priority-${task.priority}`}>
              🚩 {priorityLabels[task.priority]}
            </span>
          {task.dueDate && (
            <span className="due-date">
              📅 {new Date(task.dueDate).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
