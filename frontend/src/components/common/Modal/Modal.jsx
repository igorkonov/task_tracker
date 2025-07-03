import React, { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closable = true,
  className = '',
  overlayClassName = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущий фокус
      previousFocusRef.current = document.activeElement;

      // Блокируем скролл body
      document.body.style.overflow = 'hidden';

      // Фокус на модальном окне
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Восстанавливаем скролл
      document.body.style.overflow = '';

      // Возвращаем фокус
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closable, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closable) {
      onClose();
    }
  };

  const handleFocusTrap = (e) => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`modal-content modal-${size} ${className}`}
        tabIndex={-1}
        onKeyDown={handleFocusTrap}
        {...props}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && closable && (
              <button
                className="modal-close-button"
                onClick={onClose}
                aria-label="Закрыть"
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Компонент для футера модального окна
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`modal-footer ${className}`}>
    {children}
  </div>
);

// Компонент для действий в футере
export const ModalActions = ({ children, align = 'right', className = '' }) => (
  <div className={`modal-actions modal-actions-${align} ${className}`}>
    {children}
  </div>
);

// HOC для создания модальных окон
export const withModal = (Component) => {
  return React.forwardRef((props, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
      <>
        <Component
          ref={ref}
          {...props}
          openModal={openModal}
          closeModal={closeModal}
        />
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            {...props.modalProps}
          >
            {props.modalContent}
          </Modal>
        )}
      </>
    );
  });
};

export default Modal;
