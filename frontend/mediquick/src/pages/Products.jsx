import React, { useState, useEffect } from 'react';
import '../style/Products.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Products() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch productos, categorías y proveedores cuando el componente monta
  useEffect(() => {
    fetchInitialData();

    // Escuchar eventos de actualización de productos y valoraciones
    const handleProductsUpdated = () => {
      fetchProductos();
    };

    const handleRatingsUpdated = () => {
      // Forzar re-render para actualizar las valoraciones mostradas
      setProductos(prev => [...prev]);
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    window.addEventListener('ratingsUpdated', handleRatingsUpdated);

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
      window.removeEventListener('ratingsUpdated', handleRatingsUpdated);
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Cargar productos (crítico)
      await fetchProductos();
      
      // Cargar categorías y proveedores (opcionales)
      await Promise.allSettled([
        fetchCategorias(),
        fetchProveedores()
      ]);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        console.warn(`API productos respondió con status ${res.status}`);
        setProductos([]);
        return;
      }

      const data = await res.json();
      console.log('Productos recibidos:', data);
      setProductos(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProductos([]);
      toast.error('Error al cargar productos');
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        console.warn(`API categorías respondió con status ${res.status}`);
        setCategorias([]);
        return;
      }

      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setCategorias([]);
    }
  };

  const fetchProveedores = async () => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 401 || res.status === 403) {
        // Usuario no autenticado - usar fallback silencioso
        setProveedores([]);
        return;
      }

      if (!res.ok) {
        console.warn(`API proveedores respondió con status ${res.status} - usando fallback`);
        setProveedores([]);
        return;
      }

      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      // Error de red o conexión - usar fallback silencioso
      setProveedores([]);
    }
  };

  // Función para obtener valoración promedio de un producto
  const getProductRating = (productId) => {
    try {
      const allRatings = JSON.parse(localStorage.getItem('productRatings') || '[]');
      const productRatings = allRatings.filter(rating => rating.productId === productId);
      
      if (productRatings.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const average = productRatings.reduce((sum, rating) => sum + rating.stars, 0) / productRatings.length;
      return { average: Math.round(average * 10) / 10, count: productRatings.length };
    } catch (error) {
      console.error('Error obteniendo valoración:', error);
      return { average: 0, count: 0 };
    }
  };

  const getNombreCategoria = (id) => {
    if (!id) return 'Sin categoría';
    const cat = categorias.find((c) => c._id === id);
    return cat ? cat.name : 'Sin categoría';
  };

  const getNombreProveedor = (id) => {
    if (!id) return 'Información no disponible';
    if (proveedores.length === 0) return 'Cargando...';
    const prov = proveedores.find((p) => p._id === id);
    return prov ? prov.name : 'Proveedor no encontrado';
  };

  // Filtrar productos según búsqueda
  const filteredProducts = productos.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock disponible');
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
    toast.success(`${product.name} agregado al carrito`);
    closeModal();
  };

  // Función para manejar imágenes rotas o vacías
  const getImageSrc = (product) => {
    if (!product.image || product.image.trim() === '') {
      return null;
    }
    return product.image;
  };

  const handleImageError = (e, productName) => {
    console.log(`Error cargando imagen para: ${productName}`);
    e.target.src = '/placeholder-image.jpg';
    e.target.onerror = null;
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchInitialData}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              className="product-card"
              key={product._id}
              onClick={() => openProductModal(product)}
            >
              {/* Badge de stock */}
              {product.stock <= 5 && product.stock > 0 && (
                <div className="low-stock-badge">Poco Stock</div>
              )}
              {product.stock === 0 && (
                <div className="no-stock-badge">Agotado</div>
              )}

              {getImageSrc(product) ? (
                <img
                  src={getImageSrc(product)}
                  alt={product.name}
                  onError={(e) => handleImageError(e, product.name)}
                />
              ) : (
                <div className="no-image-placeholder">
                  <span>Sin imagen</span>
                </div>
              )}
              
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>No se encontraron productos.</p>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2500} />

      {/* Modal del producto centrado */}
      {isModalOpen && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>

            <div className="modal-content">
              <div className="product-image-section">
                {getImageSrc(selectedProduct) ? (
                  <img
                    src={getImageSrc(selectedProduct)}
                    alt={selectedProduct.name}
                    onError={(e) => handleImageError(e, selectedProduct.name)}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>Sin imagen disponible</span>
                  </div>
                )}
              </div>

              <div className="product-info-section">
                <h2>{selectedProduct.name}</h2>
                <p className="product-description">{selectedProduct.description}</p>

                {/* Mostrar stock en el modal */}
                <p className={`product-stock ${selectedProduct.stock <= 5 ? 'low-stock' : ''} ${selectedProduct.stock === 0 ? 'no-stock' : ''}`}>
                  Stock: {selectedProduct.stock} unidades
                </p>

                {/* Mostrar estrellas de valoración si existe */}
                {(() => {
                  const rating = getProductRating(selectedProduct._id);
                  return rating.count > 0 ? (
                    <div className="product-rating-stars">
                      <span className="stars">
                        {'★'.repeat(Math.floor(rating.average))}{'☆'.repeat(5 - Math.floor(rating.average))}
                      </span>
                      <span className="rating-count">
                        ({rating.count})
                      </span>
                    </div>
                  ) : null;
                })()}

                {/* Sistema de valoraciones estilo Google Play */}
                {(() => {
                  const rating = getProductRating(selectedProduct._id);
                  return rating.count > 0 ? (
                    <div className="google-play-rating">
                      <div className="rating-overview">
                        <div className="rating-score">
                          <span className="score-number">{rating.average.toFixed(1)}</span>
                          <div className="score-stars">
                            {'★'.repeat(Math.floor(rating.average))}{'☆'.repeat(5 - Math.floor(rating.average))}
                          </div>
                          <span className="review-count">{rating.count} valoración{rating.count !== 1 ? 'es' : ''}</span>
                        </div>
                        <div className="rating-bars">
                          {[5, 4, 3, 2, 1].map(star => {
                            const starRatings = JSON.parse(localStorage.getItem('productRatings') || '[]')
                              .filter(r => r.productId === selectedProduct._id);
                            const count = starRatings.filter(r => r.stars === star).length;
                            const percentage = rating.count > 0 ? (count / rating.count) * 100 : 0;
                            
                            return (
                              <div key={star} className="rating-bar-item">
                                <span className="star-number">{star}</span>
                                <div className="bar-container">
                                  <div 
                                    className="bar-fill"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="bar-count">({count})</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-rating-google">
                      <span className="no-rating-text">Sin valoraciones</span>
                      <div className="empty-stars">☆☆☆☆☆</div>
                    </div>
                  );
                })()}

                <div className="product-details">
                  <p>
                    <strong>Precio:</strong> <span>${selectedProduct.price}</span>
                  </p>
                  <p>
                    <strong>Stock disponible:</strong> <span>{selectedProduct.stock} unidades</span>
                  </p>
                  <p>
                    <strong>Categoría:</strong> <span>{getNombreCategoria(selectedProduct.categoryId)}</span>
                  </p>
                  <p>
                    <strong>Proveedor:</strong> <span>{getNombreProveedor(selectedProduct.supplierId)}</span>
                  </p>
                </div>

                <div className="modal-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(selectedProduct)}
                    disabled={selectedProduct.stock <= 0}
                  >
                    {selectedProduct.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                  </button>
                  <button className="cancel-btn" onClick={closeModal}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;