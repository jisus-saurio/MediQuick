import React, { useState, useEffect } from 'react';
import '../style/Products.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Products() {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchProveedores();

    // Escuchar cambios de productos desde AddProducts
    const handleProductsUpdated = () => {
      fetchProductos();
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);

    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/products", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        // Si la API falla, log del error pero no bloquear la UI
        console.warn(`API respondió con status ${res.status}`);
        setProductos([]);
        return;
      }
      
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      // Mantener productos vacíos en lugar de crash
      setProductos([]);
      
      // Opcionalmente, mostrar productos de ejemplo si la API falla
      // setProductos(sampleProducts);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categories", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        console.warn(`Error al obtener categorías: ${res.status}`);
        setCategorias([]);
        return;
      }
      
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      setCategorias([]);
    }
  };

  const fetchProveedores = async () => {
    try {
      const res = await fetch("/api/suppliers", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        console.warn(`Error al obtener proveedores: ${res.status}`);
        setProveedores([]);
        return;
      }
      
      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      setProveedores([]);
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

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = productos.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = (product) => {
    // Verificar si hay stock disponible
    if (product.stock <= 0) {
      toast.error("Producto sin stock disponible");
      return;
    }

    // Obtener carrito actual del localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verificar si el producto ya existe en el carrito
    const existingProductIndex = currentCart.findIndex(item => item._id === product._id);
    
    if (existingProductIndex !== -1) {
      // Si existe, aumentar cantidad
      currentCart[existingProductIndex].quantity += 1;
      currentCart[existingProductIndex].totalPrice = 
        currentCart[existingProductIndex].quantity * product.price;
    } else {
      // Si no existe, agregarlo
      currentCart.push({
        ...product,
        quantity: 1,
        totalPrice: product.price
      });
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Notificar cambio en el carrito
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    toast.success(`${product.name} agregado al carrito`);
    closeModal();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="products-page">
      <ToastContainer />
      
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Buscar productos..." 
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="search-btn">🔍</button>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div 
              className="product-card" 
              key={product._id}
              onClick={() => openProductModal(product)}
            >
              <img 
                src={product.image} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <h3>{product.name}</h3>
              <p className="product-price">${product.price}</p>
              <p className="product-stock">Stock: {product.stock}</p>
              <button 
                className="buy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  openProductModal(product);
                }}
              >
                Ver Detalles
              </button>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>No se encontraron productos.</p>
          </div>
        )}
      </div>

      {/* Modal de detalles del producto */}
      {isModalOpen && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            
            <div className="modal-content">
              <div className="product-image-section">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              
              <div className="product-info-section">
                <h2>{selectedProduct.name}</h2>
                <p className="product-description">{selectedProduct.description}</p>
                
                <div className="product-details">
                  <p><strong>Precio:</strong> ${selectedProduct.price}</p>
                  <p><strong>Stock disponible:</strong> {selectedProduct.stock} unidades</p>
                  <p><strong>Categoría:</strong> {getNombreCategoria(selectedProduct.categoryId?._id || selectedProduct.categoryId)}</p>
                  <p><strong>Proveedor:</strong> {getNombreProveedor(selectedProduct.supplierId?._id || selectedProduct.supplierId)}</p>
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