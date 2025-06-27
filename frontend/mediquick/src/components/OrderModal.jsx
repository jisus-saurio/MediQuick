import React from 'react';

const OrderModal = ({ 
  order,
  onClose,
  getStatusColor,
  getStatusText,
  formatDate,
  canRateOrder,
  canRateProduct,
  onOpenRatingModal,
  getExistingRating,
  onCancelOrder,
  getRemainingTime
}) => {
  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
  };

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Orden #{order.orderNumber || order._id?.slice(-6) || 'N/A'}</h2>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {getStatusText(order.status)}
          </span>
        </div>
        
        <div className="modal-content">
          <div className="order-details">
            <div className="detail-row">
              <strong>Fecha:</strong> 
              <span>{formatDate(order.createdAt || order.date)}</span>
            </div>
            <div className="detail-row">
              <strong>Total:</strong> 
              <span>${order.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="detail-row">
              <strong>Método de pago:</strong> 
              <span>{order.paymentMethod || 'No especificado'}</span>
            </div>
            {order.customerInfo && (
              <>
                <div className="detail-row">
                  <strong>Cliente:</strong> 
                  <span>{order.customerInfo.customerName}</span>
                </div>
                <div className="detail-row">
                  <strong>Email:</strong> 
                  <span>{order.customerInfo.email}</span>
                </div>
                <div className="detail-row">
                  <strong>Teléfono:</strong> 
                  <span>{order.customerInfo.phone}</span>
                </div>
              </>
            )}
            {(order.shippingAddress || order.customerInfo?.address) && (
              <div className="detail-row">
                <strong>Dirección de envío:</strong> 
                <span>{order.shippingAddress || order.customerInfo?.address}</span>
              </div>
            )}
          </div>
          
          <div className="order-items-list">
            <h3>Productos Ordenados</h3>
            {(order.products || []).map((item, index) => {
              const existingRating = getExistingRating(order._id, item.product_id);
              
              return (
                <div key={index} className="modal-item">
                  <img 
                    src={item.image || '/placeholder-image.jpg'} 
                    alt={item.name || 'Producto'}
                    onError={handleImageError}
                  />
                  <div className="item-details">
                    <h4>{item.name || 'Producto sin nombre'}</h4>
                    <p>{item.description || 'Sin descripción'}</p>
                    <div className="item-pricing">
                      <span>Cantidad: {item.quantity || 0}</span>
                      <span>Precio unitario: ${item.price?.toFixed(2) || '0.00'}</span>
                      <span className="item-total">Total: ${item.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    {canRateProduct(order, item) ? (
                      <div className="item-rating-section">
                        <button 
                          className="rate-product-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRatingModal(order, item);
                          }}
                        >
                          ⭐ Valorar producto
                        </button>
                      </div>
                    ) : canRateOrder(order) && item.rated && existingRating ? (
                      <div className="item-rating-section">
                        <div className="existing-rating">
                          <div className="rating-display">
                            <span className="stars">
                              {'★'.repeat(existingRating.stars)}{'☆'.repeat(5 - existingRating.stars)}
                            </span>
                            <span className="rating-info">
                              {existingRating.stars}/5 - {existingRating.deliveryOnTime ? ' ✅ A tiempo' : ' ❌ Tarde'}
                            </span>
                          </div>
                          {existingRating.comment && (
                            <p className="rating-comment">"{existingRating.comment}"</p>
                          )}
                          <button 
                            className="edit-rating-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenRatingModal(order, item);
                            }}
                          >
                            ✏️ Editar valoración
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="modal-actions">
            {order.status === 'pending' && (
              <button 
                className="cancel-order-btn"
                onClick={() => onCancelOrder(order._id)}
              >
                Cancelar Orden
              </button>
            )}
            
            {order.status === 'cancelled' && order.cancelledAt && (
              <div className="cancellation-info">
                <p style={{ 
                  fontSize: '14px', 
                  color: '#dc3545', 
                  margin: '10px 0',
                  padding: '10px',
                  backgroundColor: '#fff5f5',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  textAlign: 'center'
                }}>
                  ⏰ <strong>ORDEN CANCELADA</strong><br/>
                  Se eliminará automáticamente {getRemainingTime(order.cancelledAt)}
                </p>
              </div>
            )}
            
            <button className="close-modal-btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;