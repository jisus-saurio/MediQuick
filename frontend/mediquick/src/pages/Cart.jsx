import React, { useEffect } from 'react';
import '../style/Cart.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Hooks personalizados
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useOrderProcessing } from '../hooks/useOrderProcessing';

// Componentes
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';

function Cart() {
  const { currentUser, isLoggedIn, getUserProfile } = useAuth();
  const { cartItems, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { saveOrderToLocalStorage } = useOrders(currentUser, isLoggedIn);
  const {
    isProcessing,
    setIsProcessing,
    orderForm,
    showOrderForm,
    setShowOrderForm,
    handleOrderFormChange,
    validateOrderForm,
    updateProductStock,
    prefillFormWithUserData,
    resetForm
  } = useOrderProcessing(currentUser, isLoggedIn);

  useEffect(() => {
    prefillFormWithUserData(getUserProfile);
  }, [isLoggedIn, currentUser]);

  const processOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!showOrderForm) {
      setShowOrderForm(true);
      return;
    }

    if (!validateOrderForm()) {
      return;
    }

    if (!isLoggedIn || !currentUser) {
      toast.warning('⚠️ Debes iniciar sesión para procesar la orden');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: cartItems,
        total: total,
        customerInfo: orderForm,
        paymentMethod: orderForm.paymentMethod,
        shippingAddress: orderForm.address
      };

      // Intentar actualizar stock de cada producto
      const stockUpdatePromises = cartItems.map(item => 
        updateProductStock(item._id, item.quantity)
      );

      await Promise.allSettled(stockUpdatePromises);

      // Guardar orden en localStorage
      const savedOrder = saveOrderToLocalStorage(orderData, currentUser);

      // Notificar actualizaciones
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));

      toast.success('¡Orden procesada con éxito!');
      
      // Limpiar carrito y resetear formulario
      clearCart();
      resetForm();

      toast.info(`Orden #${savedOrder.orderNumber} creada exitosamente`);

      // Redirigir al historial de órdenes
      setTimeout(() => {
        window.location.href = '/OrderHistory';
      }, 2000);
      
    } catch (error) {
      console.error('Error procesando la orden:', error);
      toast.error('Error al procesar la orden: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <ToastContainer />
        <h1>Carrito de Compras</h1>
        <EmptyState 
          type="emptyCart"
          onNavigate={() => goBack()}
        />
      </div>
    );
  }

  return (
    <div className="cart-container">
      <ToastContainer />
      <h1>Carrito de Compras</h1>
      
      {/* Mensaje de información sobre login */}
      {!isLoggedIn && (
        <div className="login-info-banner">
          <div className="info-content">
            <span className="info-icon">💡</span>
            <span className="info-text">
              ¿Quieres valorar tus productos después de la compra? 
            </span>
            <button 
              className="login-link-btn"
              onClick={goToLogin}
            >
              Inicia sesión aquí
            </button>
          </div>
        </div>
      )}
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <CartItem
              key={item._id}
              item={item}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              isProcessing={isProcessing}
            />
          ))}
        </div>
        
        <CartSummary
          cartItems={cartItems}
          total={total}
          showOrderForm={showOrderForm}
          orderForm={orderForm}
          handleOrderFormChange={handleOrderFormChange}
          processOrder={processOrder}
          setShowOrderForm={setShowOrderForm}
          clearCart={clearCart}
          goBack={goBack}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}

export default Cart;