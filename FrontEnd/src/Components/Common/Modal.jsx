// ===== src/Components/Common/Modal.jsx =====
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import '../../Styles/Modal.css';
import Button from './Button';

/**
 * Modal Component - GOD MODE
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Footer content
 * @param {string} props.size - 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto'
 * @param {string} props.position - 'center' | 'top' | 'bottom' | 'left' | 'right'
 * @param {boolean} props.closeOnClickOutside - Close when clicking outside
 * @param {boolean} props.closeOnEsc - Close on Escape key
 * @param {boolean} props.showCloseButton - Show close button
 * @param {boolean} props.showHeader - Show header
 * @param {boolean} props.showFooter - Show footer
 * @param {string} props.closeButtonText - Custom close button text
 * @param {Function} props.onConfirm - Confirm handler
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {boolean} props.confirmLoading - Confirm button loading state
 * @param {boolean} props.cancelLoading - Cancel button loading state
 * @param {boolean} props.danger - Danger confirm button
 * @param {boolean} props.preventClose - Prevent modal from closing
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.overlayClassName - Overlay CSS classes
 * @param {Function} props.afterOpen - Callback after modal opens
 * @param {Function} props.afterClose - Callback after modal closes
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  position = 'center',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  showHeader = true,
  showFooter = true,
  closeButtonText = 'Cancel',
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmLoading = false,
  cancelLoading = false,
  danger = false,
  preventClose = false,
  className = '',
  overlayClassName = '',
  afterOpen,
  afterClose,
  ...props
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === 'Escape' && !preventClose) {
        handleClose();
      }

      // Trap focus inside modal
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements?.length) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, preventClose]);

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (closeOnClickOutside && e.target === overlayRef.current && !preventClose) {
      handleClose();
    }
  };

  // Handle close with animation
  const handleClose = () => {
    if (preventClose) return;
    
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
      if (afterClose) afterClose();
    }, 300);
  };

  // Handle confirm
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  // Handle after open
  useEffect(() => {
    if (isOpen && afterOpen) {
      setTimeout(afterOpen, 300);
    }
  }, [isOpen, afterOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={`modal-overlay ${isExiting ? 'exiting' : ''} overlay-${position} ${overlayClassName}`}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`modal-container modal-${size} modal-${position} ${isExiting ? 'exiting' : ''} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby="modal-description"
        {...props}
      >
        {/* Decorative elements */}
        <div className="modal-backdrop"></div>
        <div className="modal-pattern"></div>
        <div className="modal-glow"></div>
        
        {/* Header */}
        {showHeader && (
          <div className="modal-header">
            <div className="header-left">
              {title && (
                <h2 id="modal-title" className="modal-title">
                  <span className="title-icon">✦</span>
                  {title}
                </h2>
              )}
            </div>
            
            {showCloseButton && !preventClose && (
              <button
                className="modal-close-btn"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <span className="close-icon">×</span>
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div id="modal-description" className="modal-body">
          {children}
        </div>
        
        {/* Footer */}
        {showFooter && (
          <div className="modal-footer">
            {footer || (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={preventClose}
                  loading={cancelLoading}
                >
                  {cancelText}
                </Button>
                {onConfirm && (
                  <Button
                    variant={danger ? 'danger' : 'primary'}
                    onClick={handleConfirm}
                    loading={confirmLoading}
                    disabled={preventClose}
                  >
                    {confirmText}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default Modal;