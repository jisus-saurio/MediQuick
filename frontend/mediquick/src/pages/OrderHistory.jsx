import React, { useState, useEffect } from 'react';
import '../style/OrderHistory.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrdersFromLocalStorage();

    // Escuchar cuando se agreguen nuevas órdenes
    const handleOrdersUpdated = () => {
      loadOrdersFromLocalStorage();
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdated);

    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
    };
  }, []);

  const loadOrdersFromLocalStorage = () => {
    try {
      setLoading(true);
      // Primero limpiar órdenes canceladas vencidas
      const cleanedOrders = cleanupCancelledOrders();
      setOrders(cleanedOrders);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      setOrders([]);
      toast.error('Error cargando el historial de órdenes');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderInLocalStorage = (orderId, updates) => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = storedOrders.map(order => 
        order._id === orderId 
          ? { ...order, ...updates, updatedAt: new Date().toISOString() }
          : order
      );
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      return true;
    } catch (error) {
      console.error('Error actualizando orden:', error);
      return false;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'completed') return ['completed', 'delivered'].includes(order.status);
    return order.status === filter;
  });

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#007bff';
      case 'shipped':
        return '#17a2b8';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'delivered':
        return 'Entregada';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'shipped':
        return 'Enviada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  // Función para calcular tiempo restante hasta eliminación
  const getRemainingTime = (cancelledAt) => {
    const now = new Date();
    const cancelledDate = new Date(cancelledAt);
    const twoMinutesLater = new Date(cancelledDate.getTime() + 2 * 60 * 1000); // Cambiar a 2 minutos
    const timeLeft = twoMinutesLater - now;
    
    if (timeLeft <= 0) {
      return 'en cualquier momento';
    }
    
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (minutesLeft > 0) {
      return `en ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''} y ${secondsLeft} segundo${secondsLeft !== 1 ? 's' : ''}`;
    } else {
      return `en ${secondsLeft} segundo${secondsLeft !== 1 ? 's' : ''}`;
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      return;
    }

    try {
      // Buscar la orden
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        toast.error('Orden no encontrada');
        return;
      }

      if (order.status !== 'pending') {
        toast.error('Solo se pueden cancelar órdenes pendientes');
        return;
      }

      // Intentar restaurar stock en el servidor (opcional)
      if (order.products) {
        for (const item of order.products) {
          try {
            await fetch(`/api/products/${item.product_id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                $inc: { stock: item.quantity }
              })
            });
          } catch (error) {
            console.warn('No se pudo restaurar stock en servidor:', error);
          }
        }
      }

      // Actualizar estado de la orden a cancelada con timestamp
      const cancelledAt = new Date().toISOString();
      const updated = updateOrderInLocalStorage(orderId, { 
        status: 'cancelled',
        cancelledAt: cancelledAt
      });
      
      if (updated) {
        // Mostrar que la orden se canceló
        toast.success('✅ Orden cancelada exitosamente', {
          autoClose: 3000,
          style: { backgroundColor: '#28a745', color: 'white' }
        });
        
        // Mostrar información sobre la eliminación automática
        toast.info('🗑️ La orden será eliminada automáticamente en 2 minutos', {
          autoClose: 5000,
          style: { backgroundColor: '#17a2b8', color: 'white' }
        });
        
        // Programar eliminación automática después de 2 minutos
        setTimeout(() => {
          deleteOrderFromLocalStorage(orderId);
          // Recargar órdenes si la página aún está abierta
          loadOrdersFromLocalStorage();
          toast.info('🗑️ Orden cancelada eliminada automáticamente', {
            autoClose: 3000,
            style: { backgroundColor: '#6c757d', color: 'white' }
          });
        }, 2 * 60 * 1000); // 2 minutos en milisegundos
        
        // Notificar actualización de productos para refrescar stock
        window.dispatchEvent(new CustomEvent('productsUpdated'));
        closeModal();
      } else {
        toast.error('Error al cancelar la orden');
      }
      
    } catch (error) {
      console.error('Error al cancelar orden:', error);
      toast.error('Error al cancelar la orden');
    }
  };

  const deleteOrderFromLocalStorage = (orderId) => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const filteredOrders = storedOrders.filter(order => order._id !== orderId);
      localStorage.setItem('orderHistory', JSON.stringify(filteredOrders));
      setOrders(filteredOrders);
      return true;
    } catch (error) {
      console.error('Error eliminando orden:', error);
      return false;
    }
  };

  // Función para verificar y eliminar órdenes canceladas vencidas al cargar
  const cleanupCancelledOrders = () => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // Cambiar a 2 minutos
      
      const validOrders = storedOrders.filter(order => {
        // Mantener órdenes que NO están canceladas
        if (order.status !== 'cancelled') return true;
        
        // Para órdenes canceladas, verificar si han pasado 2 minutos
        if (order.cancelledAt) {
          const cancelledDate = new Date(order.cancelledAt);
          return cancelledDate > twoMinutesAgo; // Mantener si fue cancelada hace menos de 2 minutos
        }
        
        // Si no tiene cancelledAt, asumir que fue cancelada hace mucho tiempo
        return false;
      });
      
      // Si se eliminaron órdenes, actualizar localStorage
      if (validOrders.length !== storedOrders.length) {
        localStorage.setItem('orderHistory', JSON.stringify(validOrders));
        const removedCount = storedOrders.length - validOrders.length;
        console.log(`Se eliminaron ${removedCount} órdenes canceladas vencidas`);
        
        // Mostrar notificación si se eliminaron órdenes al cargar
        if (removedCount > 0) {
          toast.info(`🗑️ Se eliminaron ${removedCount} orden${removedCount !== 1 ? 'es' : ''} cancelada${removedCount !== 1 ? 's' : ''} vencida${removedCount !== 1 ? 's' : ''}`, {
            autoClose: 4000,
            style: { backgroundColor: '#6c757d', color: 'white' }
          });
        }
      }
      
      return validOrders;
    } catch (error) {
      console.error('Error limpiando órdenes canceladas:', error);
      return JSON.parse(localStorage.getItem('orderHistory') || '[]');
    }
  };

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando historial de compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <ToastContainer />
      
      <div className="header">
        <h1>Historial de Compras</h1>
        
        <div className="filter-bar">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Todas ({orders.length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completadas ({orders.filter(o => ['completed', 'delivered'].includes(o.status)).length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pendientes ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={filter === 'processing' ? 'active' : ''}
            onClick={() => setFilter('processing')}
          >
            Procesando ({orders.filter(o => o.status === 'processing').length})
          </button>
          <button 
            className={filter === 'cancelled' ? 'active' : ''}
            onClick={() => setFilter('cancelled')}
          >
            Canceladas ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>No hay órdenes</h2>
          <p>
            {filter === 'all' 
              ? 'Aún no has realizado ninguna compra.' 
              : `No tienes órdenes ${getStatusText(filter).toLowerCase()}.`
            }
          </p>
          <button 
            className="start-shopping-btn"
            onClick={() => window.location.href = '/products'}
          >
            Comenzar a Comprar
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div 
              key={order._id} 
              className="order-card"
              onClick={() => openOrderModal(order)}
            >
              <div className="order-header">
                <span className="order-number">#{order.orderNumber || order._id?.slice(-6) || 'N/A'}</span>
                <span 
                  className="order-status"
                  style={{ 
                    backgroundColor: getStatusColor(order.status),
                    position: 'relative'
                  }}
                >
                  {getStatusText(order.status)}
                  {/* Indicador visual para órdenes canceladas que se eliminarán pronto */}
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
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                ))}
                {(order.products?.length || 0) > 3 && (
                  <div className="more-items">+{order.products.length - 3}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles de la orden */}
      {isModalOpen && selectedOrder && (
        <div className="order-modal-overlay" onClick={closeModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <h2>Orden #{selectedOrder.orderNumber || selectedOrder._id?.slice(-6) || 'N/A'}</h2>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
              >
                {getStatusText(selectedOrder.status)}
              </span>
            </div>
            
            <div className="modal-content">
              <div className="order-details">
                <div className="detail-row">
                  <strong>Fecha:</strong> 
                  <span>{formatDate(selectedOrder.createdAt || selectedOrder.date)}</span>
                </div>
                <div className="detail-row">
                  <strong>Total:</strong> 
                  <span>${selectedOrder.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="detail-row">
                  <strong>Método de pago:</strong> 
                  <span>{selectedOrder.paymentMethod || 'No especificado'}</span>
                </div>
                {selectedOrder.customerInfo && (
                  <>
                    <div className="detail-row">
                      <strong>Cliente:</strong> 
                      <span>{selectedOrder.customerInfo.customerName}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Email:</strong> 
                      <span>{selectedOrder.customerInfo.email}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Teléfono:</strong> 
                      <span>{selectedOrder.customerInfo.phone}</span>
                    </div>
                  </>
                )}
                {(selectedOrder.shippingAddress || selectedOrder.customerInfo?.address) && (
                  <div className="detail-row">
                    <strong>Dirección de envío:</strong> 
                    <span>{selectedOrder.shippingAddress || selectedOrder.customerInfo?.address}</span>
                  </div>
                )}
              </div>
              
              <div className="order-items-list">
                <h3>Productos Ordenados</h3>
                {(selectedOrder.products || []).map((item, index) => (
                  <div key={index} className="modal-item">
                    <img 
                      src={item.image || '/placeholder-image.jpg'} 
                      alt={item.name || 'Producto'}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="item-details">
                      <h4>{item.name || 'Producto sin nombre'}</h4>
                      <p>{item.description || 'Sin descripción'}</p>
                      <div className="item-pricing">
                        <span>Cantidad: {item.quantity || 0}</span>
                        <span>Precio unitario: ${item.price?.toFixed(2) || '0.00'}</span>
                        <span className="item-total">Total: ${item.totalPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="modal-actions">
                {selectedOrder.status === 'pending' && (
                  <button 
                    className="cancel-order-btn"
                    onClick={() => cancelOrder(selectedOrder._id)}
                  >
                    Cancelar Orden
                  </button>
                )}
                
                {/* Mostrar tiempo restante para órdenes canceladas */}
                {selectedOrder.status === 'cancelled' && selectedOrder.cancelledAt && (
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
                      Se eliminará automáticamente {getRemainingTime(selectedOrder.cancelledAt)}
                    </p>
                  </div>
                )}
                
                <button className="close-modal-btn" onClick={closeModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;