import React, { useState, useEffect } from 'react';

import '../style/ProductRating.css';

function ProductRating({ 
  orderId, 
  productId, 
  productName, 
  productImage, 
  existingRating, 
  onRatingSubmitted, 
  onClose 
}) {
  const [rating, setRating] = useState(existingRating?.stars || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [deliveryOnTime, setDeliveryOnTime] = useState(existingRating?.deliveryOnTime || true);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Por favor selecciona una valoración');
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        ratingId: existingRating?.ratingId || `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        productId,
        stars: rating,
        comment: comment.trim(),
        deliveryOnTime,
        createdAt: existingRating?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Guardar en localStorage
      const ratings = JSON.parse(localStorage.getItem('productRatings') || '[]');
      
      if (existingRating) {
        // Actualizar valoración existente
        const updatedRatings = ratings.map(r => 
          r.ratingId === existingRating.ratingId ? ratingData : r
        );
        localStorage.setItem('productRatings', JSON.stringify(updatedRatings));
      } else {
        // Crear nueva valoración
        ratings.push(ratingData);
        localStorage.setItem('productRatings', JSON.stringify(ratings));
      }

      // Notificar al componente padre
      if (onRatingSubmitted) {
        onRatingSubmitted(ratingData);
      }

      // Disparar evento para actualizar otras partes de la app
      window.dispatchEvent(new CustomEvent('ratingsUpdated'));

      onClose();
    } catch (error) {
      console.error('Error al guardar valoración:', error);
      alert('Error al guardar la valoración. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoveredRating(starValue);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const getStarClass = (starIndex) => {
    const currentRating = hoveredRating || rating;
    return starIndex <= currentRating ? 'star active' : 'star';
  };

  const getRatingText = (stars) => {
    switch (stars) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return 'Selecciona una valoración';
    }
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="rating-modal-header">
          <h2>{existingRating ? 'Editar Valoración' : 'Valorar Producto'}</h2>
        </div>

        <div className="product-info">
          <img 
            src={productImage || '/placeholder-image.jpg'} 
            alt={productName}
            className="product-image"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          <div className="product-details">
            <h3>{productName}</h3>
            <p className="product-id">ID: {productId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rating-form">
          {/* Valoración por estrellas */}
          <div className="rating-section">
            <label>¿Cómo valorarías este producto?</label>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <button
                  key={starIndex}
                  type="button"
                  className={getStarClass(starIndex)}
                  onClick={() => handleStarClick(starIndex)}
                  onMouseEnter={() => handleStarHover(starIndex)}
                  onMouseLeave={handleStarLeave}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="rating-text">
              {getRatingText(hoveredRating || rating)}
            </div>
          </div>

          {/* Estado de entrega */}
          <div className="delivery-section">
            <label>¿Se entregó a tiempo?</label>
            <div className="delivery-options">
              <label className="delivery-option">
                <input
                  type="radio"
                  name="deliveryOnTime"
                  value="true"
                  checked={deliveryOnTime === true}
                  onChange={() => setDeliveryOnTime(true)}
                />
                <span className="delivery-icon">✅</span>
                Sí, llegó a tiempo
              </label>
              <label className="delivery-option">
                <input
                  type="radio"
                  name="deliveryOnTime"
                  value="false"
                  checked={deliveryOnTime === false}
                  onChange={() => setDeliveryOnTime(false)}
                />
                <span className="delivery-icon">❌</span>
                No, llegó tarde
              </label>
            </div>
          </div>

          {/* Comentario opcional */}
          <div className="comment-section">
            <label htmlFor="comment">Comentario (opcional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia con este producto..."
              maxLength={500}
              rows={4}
            />
            <div className="character-count">
              {comment.length}/500 caracteres
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : existingRating ? 'Actualizar Valoración' : 'Enviar Valoración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductRating;