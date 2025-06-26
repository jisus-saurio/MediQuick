import React, { useState, useEffect } from 'react';
import '../style/Products.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductRatingsDisplay from '../components/ProductRating';

function Products() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRatings, setShowRatings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Verificar estado de login
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    // Verificar si hay un usuario logueado (puedes ajustar esta lógica según tu sistema de auth)
    const user = localStorage.getItem('currentUser') || localStorage.getItem('userToken');
    setIsLoggedIn(!!user);
  };

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

    const handleLoginStatusChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    window.addEventListener('ratingsUpdated', handleRatingsUpdated);
    window.addEventListener('loginStatusChanged', handleLoginStatusChange);

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
      window.removeEventListener('ratingsUpdated', handleRatingsUpdated);
      window.removeEventListener('loginStatusChanged', handleLoginStatusChange);
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProductos(),
        fetchCategorias(),
        fetchProveedores()
      ]);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      setError('Error al cargar los datos');
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

      if (!res.ok) {
        console.warn(`API proveedores respondió con status ${res.status}`);
        setProveedores([]);
        return;
      }

      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
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
    const cat = categorias.find((c) => c._id === id);
    return cat ? cat.name : 'Sin categoría';
  };

  const getNombreProveedor = (id) => {
    const prov = proveedores.find((p) => p._id === id);
    return prov ? prov.name : 'Sin proveedor';
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
    setShowRatings(false); // Siempre iniciar en la pestaña de detalles
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setShowRatings(false);
  };

  const switchToRatingsTab = () => {
    setShowRatings(true);
  };

  const switchToDetailsTab = () => {
    setShowRatings(false);
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

  const handleLoginRequired = () => {
    toast.warning('Debes iniciar sesión para valorar productos', {
      autoClose: 3000,
      style: { backgroundColor: '#ffc107', color: '#333' }
    });
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
                <p className={`product-stock ${product.stock <= 5 ? 'low-stock' : ''} ${product.stock === 0 ? 'no-stock' : ''}`}>
                  Stock: {product.stock}
                </p>
                
                <button
                  className="buy-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openProductModal(product);
                  }}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Sin Stock' : 'Ver Detalles'}
                </button>
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

      {/* Modal del producto - Solo se muestra si hay un producto seleccionado */}
      {isModalOpen && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>

            {/* Pestañas del modal */}
            <div className="modal-tabs">
              <button 
                className={`modal-tab ${!showRatings ? 'active' : ''}`}
                onClick={switchToDetailsTab}
              >
                <span className="tab-icon">📋</span>
                Detalles del Producto
              </button>
              <button 
                className={`modal-tab ${showRatings ? 'active' : ''}`}
                onClick={switchToRatingsTab}
              >
                <span className="tab-icon">⭐</span>
                Valoraciones
                {(() => {
                  const rating = getProductRating(selectedProduct._id);
                  return rating.count > 0 ? (
                    <span className="ratings-count">({rating.count})</span>
                  ) : (
                    <span className="no-ratings-indicator">(0)</span>
                  );
                })()}
              </button>
            </div>

            <div className="modal-content">
              {!showRatings ? (
                // Contenido de detalles del producto
                <>
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

                    {(() => {
                      const rating = getProductRating(selectedProduct._id);
                      return rating.count > 0 ? (
                        <div className="product-rating-summary">
                          <div className="rating-display">
                            <span className="rating-stars">
                              {'★'.repeat(Math.floor(rating.average))}{'☆'.repeat(5 - Math.floor(rating.average))}
                            </span>
                            <span className="rating-text">
                              {rating.average}/5 ({rating.count} valoración{rating.count !== 1 ? 'es' : ''})
                            </span>
                          </div>
                          <button 
                            className="view-ratings-btn"
                            onClick={switchToRatingsTab}
                          >
                            Ver todas las valoraciones →
                          </button>
                        </div>
                      ) : (
                        <div className="no-rating-summary">
                          <span className="no-rating-text">Sin valoraciones aún</span>
                          <button 
                            className="view-ratings-btn"
                            onClick={switchToRatingsTab}
                          >
                            Ver valoraciones →
                          </button>
                        </div>
                      );
                    })()}

                    <div className="product-details">
                      <p>
                        <strong>Precio:</strong> ${selectedProduct.price}
                      </p>
                      <p>
                        <strong>Stock disponible:</strong> {selectedProduct.stock} unidades
                      </p>
                      <p>
                        <strong>Categoría:</strong> {getNombreCategoria(selectedProduct.categoryId)}
                      </p>
                      <p>
                        <strong>Proveedor:</strong> {getNombreProveedor(selectedProduct.supplierId)}
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
                </>
              ) : (
                // Contenido de valoraciones - Solo se muestra cuando se selecciona la pestaña
                <div className="ratings-section">
                  <div className="ratings-header">
                    <h2>Valoraciones de {selectedProduct.name}</h2>
                    <button 
                      className="back-to-details-btn"
                      onClick={switchToDetailsTab}
                    >
                      ← Volver a detalles
                    </button>
                  </div>
                  
                  {/* Mostrar mensaje si no está logueado */}
                  {!isLoggedIn && (
                    <div className="login-required-notice">
                      <div className="notice-content">
                        <span className="notice-icon">🔒</span>
                        <div className="notice-text">
                          <h4>Inicia sesión para valorar productos</h4>
                          <p>Puedes ver las valoraciones de otros usuarios, pero necesitas una cuenta para agregar tu propia valoración.</p>
                        </div>
                        <button 
                          className="login-btn"
                          onClick={() => {
                            handleLoginRequired();
                            
                          }}
                        >
                          Iniciar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <ProductRatingsDisplay 
                    productId={selectedProduct._id} 
                    showInModal={true}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;