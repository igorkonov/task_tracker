import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = ({ className }) => {
  const { theme: currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(theme => theme.id === currentTheme) || themes[0];

  return (
    <div ref={switcherRef} className={`theme-switcher-container ${isOpen ? 'open' : ''}`}>
      <button
        className={className}
        onClick={() => setIsOpen(!isOpen)}
        title="Сменить тему"
      >
        <span className="theme-icon" style={{ fontSize: '1.25rem' }}>
          {currentThemeData.icon}
        </span>
        <span>Тема</span>
      </button>

      {isOpen && (
        <div className="theme-options">
          <div className="theme-options-header">
            <h3>Выберите тему</h3>
          </div>
          <div className="theme-grid">
            {themes.map(theme => (
              <button
                key={theme.id}
                className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => handleThemeChange(theme.id)}
                data-theme={theme.id}
                title={theme.name}
              >
                <span className="theme-option-icon">{theme.icon}</span>
                <span className="theme-option-name">{theme.name}</span>
                {currentTheme === theme.id && (
                  <div className="theme-option-check">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="theme-switcher-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeSwitcher;
