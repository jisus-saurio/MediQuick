import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/home.css';

// Importa las imágenes usadas en el home
import banner1 from '../img/banner1.png';
import banner2 from '../img/banner2.jpg';
import banner3 from '../img/banner3.png';
import frascos from '../img/frascos.png';
import cat2 from '../img/pastillas.jpg';
import cat3 from '../img/cremas.jpg';

function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const images = [banner1, banner2, banner3];

  // Categorías con nombres y enlaces
  const categories = [
    { id: 1, name: 'Medicamentos', image: frascos },
    { id: 2, name: 'Pastillas', image: cat2 },
    { id: 3, name: 'Cremas', image: cat3   }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const products = Array.isArray(data) ? data : data.products || [];
        
        // Seleccionar productos destacados (primeros 3 con stock disponible)
        const featured = products
          .filter(product => product.stock > 0)
          .slice(0, 3);
        
        setFeaturedProducts(featured);
      } else {
        console.warn('No se pudieron cargar los productos');
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
    e.target.onerror = null;
  };

  const navigateToProducts = () => {
    navigate('/products');
  };

  const navigateToCategory = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  const addToCart = (product, e) => {
    e.stopPropagation(); 
    
    if (product.stock <= 0) {
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = currentCart.findIndex((item) => item._id === product._id);

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity += 1;
      currentCart[existingIndex].totalPrice = currentCart[existingIndex].quantity * product.price;
    } else {
      currentCart.push({
        ...product,
        quantity: 1,
        totalPrice: product.price,
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    // Mostrar feedback visual
    const button = e.target;
    const originalText = button.textContent;
    button.textContent = '¡Agregado!';
    button.style.background = '#22c55e';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 1500);
  };

  return (
    <div className="home-container">
      {/* Hero Section mejorado */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Bienvenido a <span className="brand-name">MediQuick</span>
          </h1>
          <p className="hero-subtitle">
            Tu farmacia de confianza. Encuentra todos los medicamentos y productos de salud que necesitas.
          </p>
          <button className="cta-button" onClick={navigateToProducts}>
            Ver Productos
          </button>
        </div>
      </section>

      {/* Carrusel de banners */}
      <section className="banner">
        <img src={images[currentImage]} alt="Banner promocional" className="banner-image" />
        <div className="banner-overlay">
        </div>
        
        {/* Indicadores del carrusel */}
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentImage === index ? 'active' : ''}`}
              onClick={() => setCurrentImage(index)}
            />
          ))}
        </div>
      </section>

      {/* Sección de categorías mejorada */}
      <section className="categories-section">
        <h2 className="section-title">Nuestras Categorías</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => navigateToCategory(category.id)}
            >
              <div className="category-image-container">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="category-image"
                  onError={handleImageError}
                />
                <div className="category-overlay">
                  <span className="category-icon">→</span>
                </div>
              </div>
              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de productos destacados */}
      <section className="featured-products-section">
        <div className="section-header">
          <h2 className="section-title">Productos Destacados</h2>
          <button className="view-all-btn" onClick={navigateToProducts}>
            Ver todos los productos
          </button>
        </div>
        
        {loading ? (
          <div className="loading-products">
            <div className="loading-spinner"></div>
            <p>Cargando productos destacados...</p>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="product-card"
                  onClick={navigateToProducts}
                >
                  <div className="product-image-container">
                    {product.image && product.image.trim() !== '' ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="product-no-image">
                        <span>📦</span>
                        <p>Sin imagen</p>
                      </div>
                    )}
                    
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="stock-badge low-stock">Poco Stock</div>
                    )}
                    {product.stock === 0 && (
                      <div className="stock-badge no-stock">Agotado</div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">
                      {product.description && product.description.length > 60
                        ? `${product.description.substring(0, 60)}...`
                        : product.description || 'Descripción no disponible'}
                    </p>
                    <div className="product-footer">
                      <span className="product-price">${product.price}</span>
                      <button
                        className={`add-to-cart-btn ${product.stock <= 0 ? 'disabled' : ''}`}
                        onClick={(e) => addToCart(product, e)}
                        disabled={product.stock <= 0}
                      >
                        {product.stock <= 0 ? 'Sin Stock' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products-message">
                <p>No hay productos destacados disponibles en este momento.</p>
                <button className="browse-products-btn" onClick={navigateToProducts}>
                  Explorar todos los productos
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Sección de características */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Envío Rápido</h3>
            <p>Entrega en 24-48 horas en toda la ciudad</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>Calidad Garantizada</h3>
            <p>Productos farmacéuticos certificados y seguros</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>Atención 24/7</h3>
            <p>Soporte y asesoría farmacéutica las 24 horas</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Pago Seguro</h3>
            <p>Múltiples métodos de pago seguros y confiables</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;