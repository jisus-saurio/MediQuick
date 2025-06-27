import React from 'react';

const EmptyState = ({ 
  type, 
  filter, 
  getStatusText, 
  onNavigate 
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'notLoggedIn':
        return {
          icon: '🔐',
          title: 'Inicia sesión para ver tus órdenes',
          description: 'Necesitas iniciar sesión para acceder a tu historial de compras personal.',
          buttonText: 'Iniciar Sesión',
          action: () => onNavigate('/login')
        };
      
      case 'emptyCart':
        return {
          icon: '🛒',
          title: 'Tu carrito está vacío',
          description: '',
          buttonText: 'Continuar Comprando',
          action: () => window.history.back()
        };
      
      case 'noOrders':
        return {
          icon: '📦',
          title: 'No hay órdenes',
          description: filter === 'all' 
            ? 'Aún no has realizado ninguna compra.' 
            : `No tienes órdenes ${getStatusText(filter).toLowerCase()}.`,
          buttonText: 'Comenzar a Comprar',
          action: () => onNavigate('/products')
        };
      
      default:
        return {
          icon: '❓',
          title: 'Estado desconocido',
          description: '',
          buttonText: 'Volver',
          action: () => window.history.back()
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="empty-orders">
      <div className="empty-icon">{content.icon}</div>
      <h2>{content.title}</h2>
      {content.description && <p>{content.description}</p>}
      <button 
        className="start-shopping-btn"
        onClick={content.action}
      >
        {content.buttonText}
      </button>
    </div>
  );
};

export default EmptyState;