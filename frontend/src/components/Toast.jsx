// ============================================================================
// Componente Toast
//
// Este componente React exibe notificações temporárias (toast) no dashboard.
// Utilizado para alertar o utilizador sobre eventos importantes em tempo real.
// ============================================================================
import React, { useEffect } from 'react';

function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`} style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: type === 'error' ? '#ffdddd' : type === 'success' ? '#ddffdd' : '#eaf6ff',
      color: '#222',
      padding: '16px 24px',
      borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      zIndex: 9999,
      fontWeight: 'bold',
      minWidth: 220
    }}>
      {message}
    </div>
  );
}

export default Toast;
