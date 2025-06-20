import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CartIcon() {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    updateCartCount();
    
    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
  };

  const goToCart = () => {
    navigate('/cart');
  };

  const styles = {
    cartIconContainer: {
      position: 'relative',
      cursor: 'pointer',
      display: 'inline-block',
      padding: '8px',
      borderRadius: '8px',
      transition: 'background-color 0.3s ease',
    },
    cartIconContainerHover: {
      backgroundColor: 'rgba(125, 187, 230, 0.1)',
    },
    cartIcon: {
      position: 'relative',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#004466',
    },
    cartBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ff6600',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      border: '2px solid white',
    }
  };

  return (
    <div 
      style={styles.cartIconContainer} 
      onClick={goToCart}
      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(125, 187, 230, 0.1)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      <div style={styles.cartIcon}>
        🛒
        {cartCount > 0 && (
          <span style={styles.cartBadge}>{cartCount}</span>
        )}
      </div>
    </div>
  );
}

export default CartIcon;