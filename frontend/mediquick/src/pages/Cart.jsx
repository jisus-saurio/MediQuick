import React, { useState, useEffect } from 'react';
import '../style/Cart.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'card'
  });
  const [showOrderForm, setShowOrderForm] = useState(false);

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

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateOrderForm = () => {
    const { customerName, email, phone, address } = orderForm;
    
    if (!customerName.trim()) {
      toast.error('El nombre es obligatorio');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Email válido es obligatorio');
      return false;
    }
    
    if (!phone.trim()) {
      toast.error('El teléfono es obligatorio');
      return false;
    }
    
    if (!address.trim()) {
      toast.error('La dirección es obligatoria');
      return false;
    }
    
    return true;
  };

  const saveOrderToLocalStorage = (orderData) => {
    try {
      // Obtener órdenes existentes
      const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      
      // Crear nueva orden
      const newOrder = {
        _id: Date.now().toString(),
        orderNumber: `ORD-${Date.now()}`,
        products: orderData.items.map(item => ({
          product_id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          image: item.image,
          description: item.description
        })),
        total: orderData.total,
        customerInfo: orderData.customerInfo,
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Agregar al inicio del array
      existingOrders.unshift(newOrder);
      
      // Guardar en localStorage
      localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
      
      return newOrder;
    } catch (error) {
      console.error('Error guardando orden:', error);
      throw error;
    }
  };

  const updateProductStock = async (productId, quantityToDeduct) => {
    try {
      // Intentar actualizar en el servidor
      const response = await fetch(`/api/products/${productId}/update-stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantityToDeduct: quantityToDeduct
        })
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.warn('No se pudo actualizar stock en servidor, continuando...');
        return null;
      }
    } catch (error) {
      console.warn('Error actualizando stock, continuando sin actualizar:', error);
      return null;
    }
  };

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

    setIsProcessing(true);

    try {
      // Crear la orden con la información del formulario
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
      const savedOrder = saveOrderToLocalStorage(orderData);

      // Notificar actualización de productos
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      
      // Notificar que hay nuevas órdenes
      window.dispatchEvent(new CustomEvent('ordersUpdated'));

      toast.success('¡Orden procesada con éxito!');
      
      // Limpiar carrito después de procesar
      setCartItems([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Resetear formulario
      setOrderForm({
        customerName: '',
        email: '',
        phone: '',
        address: '',
        paymentMethod: 'card'
      });
      setShowOrderForm(false);

      // Mostrar información de la orden
      toast.info(`Orden #${savedOrder.orderNumber} creada exitosamente`);

      // Opcional: redirigir al historial de órdenes después de 2 segundos
      setTimeout(() => {
        window.location.href = '/';
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
                src={item.image || '/placeholder-image.jpg'} 
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
                    disabled={isProcessing}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="quantity-btn"
                    disabled={isProcessing}
                  >
                    +
                  </button>
                </div>
                
                <p className="item-total">Total: ${item.totalPrice.toFixed(2)}</p>
                
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="remove-btn"
                  disabled={isProcessing}
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

            {showOrderForm && (
              <div className="order-form">
                <h3>Información de Entrega</h3>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Nombre completo"
                  value={orderForm.customerName}
                  onChange={handleOrderFormChange}
                  disabled={isProcessing}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={orderForm.email}
                  onChange={handleOrderFormChange}
                  disabled={isProcessing}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono"
                  value={orderForm.phone}
                  onChange={handleOrderFormChange}
                  disabled={isProcessing}
                  required
                />
                <textarea
                  name="address"
                  placeholder="Dirección completa"
                  value={orderForm.address}
                  onChange={handleOrderFormChange}
                  rows="3"
                  disabled={isProcessing}
                  required
                />
                <select
                  name="paymentMethod"
                  value={orderForm.paymentMethod}
                  onChange={handleOrderFormChange}
                  disabled={isProcessing}
                >
                  <option value="card">Tarjeta de Crédito/Débito</option>
                  <option value="cash">Efectivo contra entrega</option>
                  <option value="transfer">Transferencia Bancaria</option>
                </select>
              </div>
            )}
            
            <div className="cart-actions">
              <button 
                onClick={processOrder}
                className="checkout-btn"
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : (showOrderForm ? 'Confirmar Pedido' : 'Procesar Pedido')}
              </button>
              
              {showOrderForm && (
                <button 
                  onClick={() => setShowOrderForm(false)}
                  className="cancel-form-btn"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
              )}
              
              <button 
                onClick={clearCart}
                className="clear-cart-btn"
                disabled={isProcessing}
              >
                Vaciar Carrito
              </button>
              
              <button 
                onClick={goBack}
                className="continue-shopping-btn"
                disabled={isProcessing}
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