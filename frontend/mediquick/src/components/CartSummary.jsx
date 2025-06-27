import React from 'react';
import OrderForm from './OrderForm';

const CartSummary = ({ 
  cartItems,
  total,
  showOrderForm,
  orderForm,
  handleOrderFormChange,
  processOrder,
  setShowOrderForm,
  clearCart,
  goBack,
  isProcessing
}) => {
  return (
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
          <OrderForm
            orderForm={orderForm}
            handleOrderFormChange={handleOrderFormChange}
            isProcessing={isProcessing}
          />
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
  );
};

export default CartSummary;