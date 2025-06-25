import React, { useState, useEffect } from 'react';
import '../style/ProductRatingsDisplay.css';

function ProductRatingsDisplay({ productId, showInModal = false }) {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [deliveryStats, setDeliveryStats] = useState({ onTime: 0, late: 0 });

  useEffect(() => {
    loadProductRatings();
  }, [productId]);

  const loadProductRatings = () => {
    try {
      const allRatings = JSON.parse(localStorage.getItem('productRatings') || '[]');
      const productRatings = allRatings.filter(rating => rating.productId === productId);
      
      setRatings(productRatings);
      setTotalRatings(productRatings.length);
      
      if (productRatings.length > 0) {
        // Calcular promedio de estrellas
        const avgStars = productRatings.reduce((sum, rating) => sum + rating.stars, 0) / productRatings.length;
        setAverageRating(avgStars);
        
        // Calcular estadísticas de entrega
        const onTimeCount = productRatings.filter(rating => rating.deliveryOnTime).length;
        const lateCount = productRatings.length - onTimeCount;
        setDeliveryStats({ onTime: onTimeCount, late: lateCount });
      } else {
        setAverageRating(0);
        setDeliveryStats({ onTime: 0, late: 0 });
      }
    } catch (error) {
      console.error('Error cargando valoraciones:', error);
      setRatings([]);
      setAverageRating(0);
      setTotalRatings(0);
      setDeliveryStats({ onTime: 0, late: 0 });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStarDisplay = (stars) => {
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  const getRatingText = (stars) => {
    switch (stars) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return '';
    }
  };

  const getDeliveryPercentage = () => {
    if (totalRatings === 0) return 0;
    return Math.round((deliveryStats.onTime / totalRatings) * 100);
  };

  if (totalRatings === 0) {
    return (
      <div className={`ratings-display ${showInModal ? 'modal-version' : ''}`}>
        <div className="no-ratings">
          <div className="no-ratings-icon">⭐</div>
          <h3>Sin valoraciones aún</h3>
          <p>Sé el primero en valorar este producto</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ratings-display ${showInModal ? 'modal-version' : ''}`}>
      {/* Resumen de valoraciones */}
      <div className="ratings-summary">
        <div className="average-rating">
          <div className="average-stars">
            {getStarDisplay(Math.round(averageRating))}
          </div>
          <div className="average-info">
            <span className="average-number">{averageRating.toFixed(1)}/5</span>
            <span className="total-ratings">
              {totalRatings} valoración{totalRatings !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>

        <div className="delivery-stats">
          <div className="delivery-stat">
            <span className="delivery-icon">✅</span>
            <span className="delivery-text">
              {getDeliveryPercentage()}% entregado a tiempo
            </span>
          </div>
          <div className="delivery-breakdown">
            <span className="on-time">A tiempo: {deliveryStats.onTime}</span>
            <span className="late">Tarde: {deliveryStats.late}</span>
          </div>
        </div>
      </div>

      {/* Distribución de estrellas */}
      <div className="rating-distribution">
        <h4>Distribución de valoraciones</h4>
        {[5, 4, 3, 2, 1].map(star => {
          const count = ratings.filter(r => r.stars === star).length;
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
          
          return (
            <div key={star} className="rating-bar">
              <span className="star-label">{star} ★</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="rating-count">({count})</span>
            </div>
          );
        })}
      </div>

      {/* Lista de valoraciones individuales */}
      <div className="individual-ratings">
        <h4>Valoraciones de clientes</h4>
        <div className="ratings-list">
          {ratings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, showInModal ? ratings.length : 5)
            .map((rating, index) => (
              <div key={rating.ratingId || index} className="rating-item">
                <div className="rating-header">
                  <div className="rating-stars">
                    {getStarDisplay(rating.stars)}
                  </div>
                  <div className="rating-meta">
                    <span className="rating-level">{getRatingText(rating.stars)}</span>
                    <span className="rating-date">{formatDate(rating.createdAt)}</span>
                  </div>
                </div>
                
                <div className="rating-details">
                  <div className="delivery-status">
                    {rating.deliveryOnTime ? (
                      <span className="delivery-good">✅ Entregado a tiempo</span>
                    ) : (
                      <span className="delivery-bad">❌ Entrega tardía</span>
                    )}
                  </div>
                  
                  {rating.comment && rating.comment.trim() && (
                    <div className="rating-comment">
                      <p>"{rating.comment}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        
        {!showInModal && ratings.length > 5 && (
          <div className="show-more">
            <button className="show-more-btn">
              Ver todas las valoraciones ({ratings.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductRatingsDisplay;