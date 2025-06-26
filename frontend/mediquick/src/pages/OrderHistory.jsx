import React, { useState, useEffect } from 'react';
import '../style/OrderHistory.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductRating from '../components/ProductRating';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedProductForRating, setSelectedProductForRating] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    
    // Escuchar cuando se agreguen nuevas órdenes
    const handleOrdersUpdated = () => {
      if (isLoggedIn && currentUser) {
        loadOrdersFromLocalStorage();
      }
    };

    const handleLoginChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdated);
    window.addEventListener('loginStateChanged', handleLoginChange);

    // Iniciar el sistema de progresión automática de estados
    const progressionInterval = startOrderStatusProgression();

    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
      window.removeEventListener('loginStateChanged', handleLoginChange);
      if (progressionInterval) {
        clearInterval(progressionInterval);
      }
    };
  }, []);

  // Cargar órdenes cuando cambie el estado de login o el usuario
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadOrdersFromLocalStorage();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isLoggedIn, currentUser]);

  const checkLoginStatus = () => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        setIsLoggedIn(true);
        setCurrentUser(sessionData);
      } catch (error) {
        console.error('Error parsing session data:', error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  // Sistema de progresión automática de estados
  const startOrderStatusProgression = () => {
    const intervalId = setInterval(() => {
      updateOrderStatuses();
    }, 10000); // Verificar cada 10 segundos

    return intervalId;
  };

  const updateOrderStatuses = () => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      let ordersUpdated = false;
      
      const updatedOrders = storedOrders.map(order => {
        const now = new Date();
        const orderDate = new Date(order.createdAt);
        const timeDifference = now - orderDate;
        
        // 1 minuto = 60000 ms, 2 minutos = 120000 ms
        const oneMinute = 60000;
        const twoMinutes = 120000;
        
        let newStatus = order.status;
        
        // Solo cambiar estado si no está cancelado
        if (order.status !== 'cancelled') {
          if (order.status === 'pending' && timeDifference >= oneMinute) {
            newStatus = 'processing';
            ordersUpdated = true;
          } else if (order.status === 'processing' && timeDifference >= twoMinutes) {
            newStatus = 'completed';
            ordersUpdated = true;
          }
        }
        
        return newStatus !== order.status 
          ? { ...order, status: newStatus, updatedAt: now.toISOString() }
          : order;
      });
      
      if (ordersUpdated) {
        localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
        setOrders(updatedOrders);
        
        // Mostrar notificación de cambio de estado
        const newlyCompleted = updatedOrders.filter(order => 
          order.status === 'completed' && 
          storedOrders.find(orig => orig._id === order._id)?.status === 'processing'
        );
        
        const newlyProcessing = updatedOrders.filter(order => 
          order.status === 'processing' && 
          storedOrders.find(orig => orig._id === order._id)?.status === 'pending'
        );
        
        newlyProcessing.forEach(order => {
          toast.info(`📦 Orden #${order.orderNumber || order._id?.slice(-6)} está siendo procesada`, {
            autoClose: 4000,
            style: { backgroundColor: '#007bff', color: 'white' }
          });
        });
        
        newlyCompleted.forEach(order => {
          toast.success(`✅ Orden #${order.orderNumber || order._id?.slice(-6)} completada - ¡Ya puedes valorar tus productos!`, {
            autoClose: 5000,
            style: { backgroundColor: '#28a745', color: 'white' }
          });
        });
      }
    } catch (error) {
      console.error('Error actualizando estados de órdenes:', error);
    }
  };

  const loadOrdersFromLocalStorage = () => {
    try {
      setLoading(true);
      
      if (!isLoggedIn || !currentUser) {
        console.log('Usuario no logueado en OrderHistory'); // Debug
        setOrders([]);
        return;
      }

      console.log('Cargando órdenes para usuario en OrderHistory:', currentUser); // Debug

      // Cargar solo órdenes del usuario actual
      const allOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      console.log('Total de órdenes en storage:', allOrders.length); // Debug
      
      const userOrders = allOrders.filter(order => {
        const matchesUserId = order.userId === currentUser.userId;
        const matchesEmail = order.customerInfo && order.customerInfo.email === currentUser.email;
        const matchesUserEmail = order.userEmail === currentUser.email;
        
        console.log(`Orden ${order._id}:`, { // Debug
          userId: order.userId,
          currentUserId: currentUser.userId,
          matchesUserId,
          matchesEmail,
          matchesUserEmail
        });
        
        return matchesUserId || matchesEmail || matchesUserEmail;
      });
      
      console.log('Órdenes filtradas para el usuario:', userOrders.length); // Debug
      
      // Limpiar órdenes canceladas vencidas solo del usuario actual
      const cleanedOrders = cleanupCancelledOrders(userOrders);
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

  // Función para obtener valoración existente de un producto
  const getExistingRating = (orderId, productId) => {
    try {
      const ratings = JSON.parse(localStorage.getItem('productRatings') || '[]');
      return ratings.find(rating => rating.orderId === orderId && rating.productId === productId);
    } catch (error) {
      console.error('Error obteniendo valoración:', error);
      return null;
    }
  };

  // Función para verificar si una orden puede ser valorada
  const canRateOrder = (order) => {
    return ['completed', 'delivered'].includes(order.status);
  };

  // Función para verificar si un producto específico puede ser valorado
  const canRateProduct = (order, product) => {
    return canRateOrder(order) && !product.rated;
  };

  // Función para abrir modal de valoración
  const openRatingModal = (order, product) => {
    const existingRating = getExistingRating(order._id, product.product_id);
    setSelectedProductForRating({
      orderId: order._id,
      productId: product.product_id,
      productName: product.name,
      productImage: product.image,
      existingRating
    });
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedProductForRating(null);
  };

  const handleRatingSubmitted = (ratingData) => {
    // Actualizar la orden para marcar el producto como valorado
    const updatedOrders = orders.map(order => {
      if (order._id === ratingData.orderId) {
        const updatedProducts = order.products.map(product => {
          if (product.product_id === ratingData.productId) {
            return { ...product, rated: true, ratingId: ratingData.ratingId };
          }
          return product;
        });
        return { ...order, products: updatedProducts };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
    closeRatingModal();
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
    const twoMinutesLater = new Date(cancelledDate.getTime() + 2 * 60 * 1000);
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

      const cancelledAt = new Date().toISOString();
      const updated = updateOrderInLocalStorage(orderId, { 
        status: 'cancelled',
        cancelledAt: cancelledAt
      });
      
      if (updated) {
        toast.success('✅ Orden cancelada exitosamente', {
          autoClose: 3000,
          style: { backgroundColor: '#28a745', color: 'white' }
        });
        
        toast.info('🗑️ La orden será eliminada automáticamente en 2 minutos', {
          autoClose: 5000,
          style: { backgroundColor: '#17a2b8', color: 'white' }
        });
        
        setTimeout(() => {
          deleteOrderFromLocalStorage(orderId);
          loadOrdersFromLocalStorage();
          toast.info('🗑️ Orden cancelada eliminada automáticamente', {
            autoClose: 3000,
            style: { backgroundColor: '#6c757d', color: 'white' }
          });
        }, 2 * 60 * 1000);
        
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

  const cleanupCancelledOrders = (userOrders) => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      
      const validOrders = storedOrders.filter(order => {
        if (order.status !== 'cancelled') return true;
        
        if (order.cancelledAt) {
          const cancelledDate = new Date(order.cancelledAt);
          return cancelledDate > twoMinutesAgo;
        }
        
        return false;
      });
      
      if (validOrders.length !== storedOrders.length) {
        localStorage.setItem('orderHistory', JSON.stringify(validOrders));
        const removedCount = storedOrders.length - validOrders.length;
        console.log(`Se eliminaron ${removedCount} órdenes canceladas vencidas`);
        
        if (removedCount > 0) {
          toast.info(`🗑️ Se eliminaron ${removedCount} orden${removedCount !== 1 ? 'es' : ''} cancelada${removedCount !== 1 ? 's' : ''} vencida${removedCount !== 1 ? 's' : ''}`, {
            autoClose: 4000,
            style: { backgroundColor: '#6c757d', color: 'white' }
          });
        }
      }
      
      // Retornar solo las órdenes del usuario actual después de la limpieza
      if (isLoggedIn && currentUser) {
        return validOrders.filter(order => 
          order.userId === currentUser.userId || 
          (order.customerInfo && order.customerInfo.email === currentUser.email)
        );
      }
      
      return [];
    } catch (error) {
      console.error('Error limpiando órdenes canceladas:', error);
      return userOrders || [];
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

      {!isLoggedIn ? (
        <div className="empty-orders">
          <div className="empty-icon">🔐</div>
          <h2>Inicia sesión para ver tus órdenes</h2>
          <p>
            Necesitas iniciar sesión para acceder a tu historial de compras personal.
          </p>
          <button 
            className="start-shopping-btn"
            onClick={() => window.location.href = '/login'}
          >
            Iniciar Sesión
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
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

              {/* Indicador de valoración disponible */}
              {canRateOrder(order) && (
                <div className="rating-available">
                  <span className="rating-badge">
                    ⭐ {order.products?.some(p => !p.rated) ? 'Valorar productos' : 'Productos valorados'}
                  </span>
                </div>
              )}
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
                {(selectedOrder.products || []).map((item, index) => {
                  const existingRating = getExistingRating(selectedOrder._id, item.product_id);
                  
                  return (
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
                        
                        {/* Mostrar valoración existente o botón para valorar */}
                        {canRateProduct(selectedOrder, item) ? (
                          <div className="item-rating-section">
                            <button 
                              className="rate-product-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRatingModal(selectedOrder, item);
                              }}
                            >
                              ⭐ Valorar producto
                            </button>
                          </div>
                        ) : canRateOrder(selectedOrder) && item.rated && existingRating ? (
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
                                  openRatingModal(selectedOrder, item);
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
                {selectedOrder.status === 'pending' && (
                  <button 
                    className="cancel-order-btn"
                    onClick={() => cancelOrder(selectedOrder._id)}
                  >
                    Cancelar Orden
                  </button>
                )}
                
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

      {/* Modal de valoración de productos */}
      {ratingModalOpen && selectedProductForRating && (
        <ProductRating
          orderId={selectedProductForRating.orderId}
          productId={selectedProductForRating.productId}
          productName={selectedProductForRating.productName}
          productImage={selectedProductForRating.productImage}
          existingRating={selectedProductForRating.existingRating}
          onRatingSubmitted={handleRatingSubmitted}
          onClose={closeRatingModal}
        />
      )}
    </div>
  );
}

export default OrderHistory;