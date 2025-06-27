import React from 'react';

const OrderForm = ({ 
  orderForm, 
  handleOrderFormChange, 
  isProcessing 
}) => {
  return (
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
  );
};

export default OrderForm;