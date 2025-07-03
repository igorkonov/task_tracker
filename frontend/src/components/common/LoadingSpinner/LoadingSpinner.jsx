import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  text = null,
  className = '',
  overlay = false,
  ...props
}) => {
  const spinnerClass = `loading-spinner loading-spinner-${size} loading-spinner-${color} ${className}`;

  const SpinnerComponent = (
    <div className={spinnerClass} {...props}>
      <div className="spinner-circle">
        <div className="spinner-inner"></div>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {SpinnerComponent}
      </div>
    );
  }

  return SpinnerComponent;
};

// Компонент с точками
export const LoadingDots = ({
  size = 'medium',
  color = 'primary',
  text = null,
  className = ''
}) => (
  <div className={`loading-dots loading-dots-${size} loading-dots-${color} ${className}`}>
    <div className="dots-container">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
    {text && <span className="dots-text">{text}</span>}
  </div>
);

// Компонент с пульсацией
export const LoadingPulse = ({
  size = 'medium',
  color = 'primary',
  text = null,
  className = ''
}) => (
  <div className={`loading-pulse loading-pulse-${size} loading-pulse-${color} ${className}`}>
    <div className="pulse-circle"></div>
    {text && <span className="pulse-text">{text}</span>}
  </div>
);

// Компонент с волнами
export const LoadingWave = ({
  size = 'medium',
  color = 'primary',
  text = null,
  className = ''
}) => (
  <div className={`loading-wave loading-wave-${size} loading-wave-${color} ${className}`}>
    <div className="wave-container">
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
      <div className="wave-bar"></div>
    </div>
    {text && <span className="wave-text">{text}</span>}
  </div>
);

// Компонент скелетона
export const LoadingSkeleton = ({
  width = '100%',
  height = '20px',
  className = '',
  lines = 1,
  animated = true
}) => (
  <div className={`loading-skeleton ${animated ? 'skeleton-animated' : ''} ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <div
        key={index}
        className="skeleton-line"
        style={{
          width: Array.isArray(width) ? width[index] || width[0] : width,
          height: Array.isArray(height) ? height[index] || height[0] : height
        }}
      />
    ))}
  </div>
);

// HOC для добавления состояния загрузки
export const withLoading = (Component) => {
  return React.forwardRef(({ loading, loadingProps, ...props }, ref) => {
    if (loading) {
      return <LoadingSpinner {...loadingProps} />;
    }
    return <Component ref={ref} {...props} />;
  });
};

// Хук для управления загрузкой
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setLoading(true), []);
  const stopLoading = React.useCallback(() => setLoading(false), []);
  const toggleLoading = React.useCallback(() => setLoading(prev => !prev), []);

  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading
  };
};

export default LoadingSpinner;
