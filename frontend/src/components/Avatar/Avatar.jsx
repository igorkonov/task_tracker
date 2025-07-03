import React from 'react';
import './Avatar.css';

const Avatar = ({
  user,
  size = 'medium',
  showName = false,
  showStatus = false,
  onClick,
  className = ''
}) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return '#6b7280';

    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'avatar-small';
      case 'large': return 'avatar-large';
      case 'xl': return 'avatar-xl';
      default: return 'avatar-medium';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'away': return '#f59e0b';
      case 'busy': return '#ef4444';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const avatarStyle = {
    backgroundColor: user?.avatar ? 'transparent' : getAvatarColor(user?.name),
    backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className={`avatar-container ${className}`}>
      <div
        className={`avatar ${getSizeClass()} ${onClick ? 'clickable' : ''}`}
        style={avatarStyle}
        onClick={onClick}
        title={user?.name || 'Пользователь'}
      >
        {!user?.avatar && (
          <span className="avatar-initials">
            {getInitials(user?.name)}
          </span>
        )}

        {showStatus && user?.status && (
          <div
            className="avatar-status"
            style={{ backgroundColor: getStatusColor(user.status) }}
            title={user.status}
          />
        )}
      </div>

      {showName && user?.name && (
        <span className="avatar-name">{user.name}</span>
      )}
    </div>
  );
};

export default Avatar;
