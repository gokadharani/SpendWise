import React from 'react';

const ToastContainer = ({ toasts }) => {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => {
        let iconClass = 'fa-bell';
        if (toast.type === 'success') iconClass = 'fa-circle-check';
        if (toast.type === 'danger') iconClass = 'fa-circle-xmark';
        if (toast.type === 'warning') iconClass = 'fa-triangle-exclamation';
        if (toast.type === 'info') iconClass = 'fa-circle-info';

        return (
          <div key={toast.id} className={`toast toast-${toast.type}`} style={{
            opacity: toast.closing ? 0 : 1,
            transform: toast.closing ? 'translateY(10px)' : 'translateY(0)',
            transition: 'all 0.3s ease'
          }}>
            <i className={`fa-solid ${iconClass}`}></i>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
