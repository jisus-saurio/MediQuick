import { useState } from 'react';

export const useRatings = () => {
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedProductForRating, setSelectedProductForRating] = useState(null);

  const getExistingRating = (orderId, productId) => {
    try {
      const ratings = JSON.parse(localStorage.getItem('productRatings') || '[]');
      return ratings.find(rating => rating.orderId === orderId && rating.productId === productId);
    } catch (error) {
      console.error('Error obteniendo valoración:', error);
      return null;
    }
  };

  const canRateOrder = (order) => {
    return ['completed', 'delivered'].includes(order.status);
  };

  const canRateProduct = (order, product) => {
    return canRateOrder(order) && !product.rated;
  };

  const openRatingModal = (order, product) => {
    const existingRating = getExistingRating(order._id, product.product_id);
    setSelectedProductForRating({
      orderId: order._id,
      productId: product.product_id,
      productName: product.name,
      productImage: product.image,
      existingRating
    });
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setSelectedProductForRating(null);
  };

  const handleRatingSubmitted = (ratingData, orders, setOrders) => {
    const updatedOrders = orders.map(order => {
      if (order._id === ratingData.orderId) {
        const updatedProducts = order.products.map(product => {
          if (product.product_id === ratingData.productId) {
            return { ...product, rated: true, ratingId: ratingData.ratingId };
          }
          return product;
        });
        return { ...order, products: updatedProducts };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
    closeRatingModal();
  };

  return {
    ratingModalOpen,
    selectedProductForRating,
    getExistingRating,
    canRateOrder,
    canRateProduct,
    openRatingModal,
    closeRatingModal,
    handleRatingSubmitted
  };
};