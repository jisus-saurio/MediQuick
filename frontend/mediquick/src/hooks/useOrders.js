import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useOrders = (currentUser, isLoggedIn) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const saveOrderToLocalStorage = (orderData, currentUser) => {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      
      if (!currentUser || !currentUser.userId) {
        console.error('No hay usuario actual para asociar la orden');
        throw new Error('Usuario no identificado');
      }
      
      const newOrder = {
        _id: Date.now().toString(),
        orderNumber: `ORD-${Date.now()}`,
        userId: currentUser.userId,
        userEmail: currentUser.email,
        products: orderData.items.map(item => ({
          product_id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          image: item.image,
          description: item.description,
          rated: false
        })),
        total: orderData.total,
        customerInfo: orderData.customerInfo,
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      existingOrders.unshift(newOrder);
      localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
      
      return newOrder;
    } catch (error) {
      console.error('Error guardando orden:', error);
      throw error;
    }
  };

  const loadOrdersFromLocalStorage = () => {
    try {
      setLoading(true);
      
      if (!isLoggedIn || !currentUser) {
        setOrders([]);
        return;
      }

      const allOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const userOrders = allOrders.filter(order => {
        const matchesUserId = order.userId === currentUser.userId;
        const matchesEmail = order.customerInfo && order.customerInfo.email === currentUser.email;
        const matchesUserEmail = order.userEmail === currentUser.email;
        
        return matchesUserId || matchesEmail || matchesUserEmail;
      });
      
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
        
        if (removedCount > 0) {
          toast.info(`🗑️ Se eliminaron ${removedCount} orden${removedCount !== 1 ? 'es' : ''} cancelada${removedCount !== 1 ? 's' : ''} vencida${removedCount !== 1 ? 's' : ''}`, {
            autoClose: 4000,
            style: { backgroundColor: '#6c757d', color: 'white' }
          });
        }
      }
      
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

  const updateOrderStatuses = () => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      let ordersUpdated = false;
      
      const updatedOrders = storedOrders.map(order => {
        const now = new Date();
        const orderDate = new Date(order.createdAt);
        const timeDifference = now - orderDate;
        
        const oneMinute = 60000;
        const twoMinutes = 120000;
        
        let newStatus = order.status;
        
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

  const startOrderStatusProgression = () => {
    const intervalId = setInterval(() => {
      updateOrderStatuses();
    }, 10000);

    return intervalId;
  };

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadOrdersFromLocalStorage();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    const handleOrdersUpdated = () => {
      if (isLoggedIn && currentUser) {
        loadOrdersFromLocalStorage();
      }
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdated);
    const progressionInterval = startOrderStatusProgression();

    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
      if (progressionInterval) {
        clearInterval(progressionInterval);
      }
    };
  }, [isLoggedIn, currentUser]);

  return {
    orders,
    loading,
    saveOrderToLocalStorage,
    loadOrdersFromLocalStorage,
    updateOrderInLocalStorage,
    deleteOrderFromLocalStorage,
    updateOrderStatuses
  };
};