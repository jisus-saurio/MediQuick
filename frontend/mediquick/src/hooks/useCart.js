import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  return {
    cartItems,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCartFromStorage
  };
};