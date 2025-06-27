import React, { useState } from 'react';
import '../style/OrderHistory.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Hooks personalizados
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { useRatings } from '../hooks/useRatings';

// Componentes
import FilterBar from '../components/FilterBar';
import OrderCard from '../components/OrderCard';
import OrderModal from '../components/OrderModal';
import EmptyState from '../components/EmptyState';
import ProductRating from '../components/ProductRating';

function OrderHistory() {
  const { currentUser, isLoggedIn } = useAuth();
  const { orders, loading, updateOrderInLocalStorage, deleteOrderFromLocalStorage } = useOrders(currentUser, isLoggedIn);
  const {
    ratingModalOpen,
    selectedProductForRating,
    getExistingRating,
    canRateOrder,
    canRateProduct,
    openRatingModal,
    closeRatingModal,
    handleRatingSubmitted
  } = useRatings();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Utility functions
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
    const colors = {
      completed: '#28a745',
      delivered: '#28a745',
      pending: '#ffc107',
      processing: '#007bff',
      shipped: '#17a2b8',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      completed: 'Completada',
      delivered: 'Entregada',
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviada',
      cancelled: 'Cancelada'
    };
    return texts[status] || 'Desconocido';
  };

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

  // Modal handlers
  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Order actions
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

      // Intentar restaurar stock en el servidor
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

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'completed') return ['completed', 'delivered'].includes(order.status);
    return order.status === filter;
  });

  const onRatingSubmitted = (ratingData) => {
    handleRatingSubmitted(ratingData, orders, () => {});
  };

  const onNavigate = (path) => {
    window.location.href = path;
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
        <FilterBar 
          filter={filter}
          setFilter={setFilter}
          orders={orders}
        />
      </div>

      {!isLoggedIn ? (
        <EmptyState 
          type="notLoggedIn"
          onNavigate={onNavigate}
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState 
          type="noOrders"
          filter={filter}
          getStatusText={getStatusText}
          onNavigate={onNavigate}
        />
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onOpenModal={openOrderModal}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              formatDate={formatDate}
              canRateOrder={canRateOrder}
            />
          ))}
        </div>
      )}

      {/* Modal de detalles de la orden */}
      {isModalOpen && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={closeModal}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          formatDate={formatDate}
          canRateOrder={canRateOrder}
          canRateProduct={canRateProduct}
          onOpenRatingModal={openRatingModal}
          getExistingRating={getExistingRating}
          onCancelOrder={cancelOrder}
          getRemainingTime={getRemainingTime}
        />
      )}

      {/* Modal de valoración de productos */}
      {ratingModalOpen && selectedProductForRating && (
        <ProductRating
          orderId={selectedProductForRating.orderId}
          productId={selectedProductForRating.productId}
          productName={selectedProductForRating.productName}
          productImage={selectedProductForRating.productImage}
          existingRating={selectedProductForRating.existingRating}
          onRatingSubmitted={onRatingSubmitted}
          onClose={closeRatingModal}
        />
      )}
    </div>
  );
}

export default OrderHistory;