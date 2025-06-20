import React, { useState, useEffect } from 'react';
import '../style/Cart.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const loadCartFromStorage = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const calculateTotal = () => {
    const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotal(totalAmount);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map(item => {
      if (item._id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.price
        };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    toast.success('Cantidad actualizada');
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    toast.success('Producto eliminado del carrito');
  };

  const clearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      setCartItems([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      toast.success('Carrito vaciado');
    }
  };

  const processOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    try {
      const orderData = {
        items: cartItems,
        total: total,
        date: new Date().toISOString()
      };

      console.log('Procesando orden:', orderData);
      
      // Simular procesamiento
      toast.success('¡Orden procesada con éxito!');
      
      // Limpiar carrito después de procesar
      setCartItems([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
    } catch (error) {
      console.error('Error procesando la orden:', error);
      toast.error('Error al procesar la orden');
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <ToastContainer />
        <h1>Carrito de Compras</h1>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p>Tu carrito está vacío</p>
          <button 
            className="continue-shopping-btn"
            onClick={goBack}
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <ToastContainer />
      <h1>Carrito de Compras</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <img 
                src={item.image} 
                alt={item.name}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <p className="item-price">Precio unitario: ${item.price}</p>
              </div>
              
              <div className="item-controls">
                <div className="quantity-controls">
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                
                <p className="item-total">Total: ${item.totalPrice.toFixed(2)}</p>
                
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="remove-btn"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <div className="summary-content">
            <h2>Resumen del Pedido</h2>
            <div className="summary-line">
              <span>Subtotal ({cartItems.length} productos):</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Envío:</span>
              <span>Gratis</span>
            </div>
            <div className="summary-line total-line">
              <span><strong>Total:</strong></span>
              <span><strong>${total.toFixed(2)}</strong></span>
            </div>
            
            <div className="cart-actions">
              <button 
                onClick={processOrder}
                className="checkout-btn"
              >
                Procesar Pedido
              </button>
              
              <button 
                onClick={clearCart}
                className="clear-cart-btn"
              >
                Vaciar Carrito
              </button>
              
              <button 
                onClick={goBack}
                className="continue-shopping-btn"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;