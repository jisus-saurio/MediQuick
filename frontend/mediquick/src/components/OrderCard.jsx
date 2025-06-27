import React from 'react';

const OrderCard = ({ 
  order, 
  onOpenModal, 
  getStatusColor, 
  getStatusText, 
  formatDate,
  canRateOrder 
}) => {
  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
  };

  return (
    <div 
      className="order-card"
      onClick={() => onOpenModal(order)}
    >
      <div className="order-header">
        <span className="order-number">
          #{order.orderNumber || order._id?.slice(-6) || 'N/A'}
        </span>
        <span 
          className="order-status"
          style={{ 
            backgroundColor: getStatusColor(order.status),
            position: 'relative'
          }}
        >
          {getStatusText(order.status)}
          {order.status === 'cancelled' && order.cancelledAt && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '10px',
              height: '10px',
              backgroundColor: '#ffc107',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></span>
          )}
        </span>
      </div>
      
      <div className="order-info">
        <p className="order-date">{formatDate(order.createdAt || order.date)}</p>
        <p className="order-total">${order.total?.toFixed(2) || '0.00'}</p>
        <p className="order-items">
          {(order.products?.length || 0)} producto{((order.products?.length || 0) !== 1) ? 's' : ''}
        </p>
      </div>
      
      <div className="order-preview">
        {(order.products || []).slice(0, 3).map((item, index) => (
          <img 
            key={index}
            src={item.image || '/placeholder-image.jpg'} 
            alt={item.name || 'Producto'}
            className="preview-img"
            onError={handleImageError}
          />
        ))}
        {(order.products?.length || 0) > 3 && (
          <div className="more-items">+{order.products.length - 3}</div>
        )}
      </div>

      {canRateOrder(order) && (
        <div className="rating-available">
          <span className="rating-badge">
            ⭐ {order.products?.some(p => !p.rated) ? 'Valorar productos' : 'Productos valorados'}
          </span>
        </div>
      )}
    </div>
  );
};

export default OrderCard;