import React from 'react';

const CartItem = ({ 
  item, 
  updateQuantity, 
  removeFromCart, 
  isProcessing 
}) => {
  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
  };

  return (
    <div className="cart-item">
      <img 
        src={item.image || '/placeholder-image.jpg'} 
        alt={item.name}
        onError={handleImageError}
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
  );
};

export default CartItem;