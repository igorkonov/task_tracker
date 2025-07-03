import React from 'react'
import './Button.css'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  style = {},
  disableRipple = false
}) => {
  const buttonClasses = [
    !disableRipple && 'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading && 'btn-loading',
    disabled && 'btn-disabled',
    fullWidth && 'btn-full-width',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
    >
      {loading && <div className="btn-spinner"><LoadingSpinner size="sm" /></div>}
      {leftIcon && !loading && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
      {!loading && <span className="btn-text">{children}</span>}
      {rightIcon && !loading && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
    </button>
  )
}

export default Button
