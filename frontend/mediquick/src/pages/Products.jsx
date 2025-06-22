import React, { useState } from 'react';
import '../style/Products.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const sampleProducts = [
  { title: 'Acetaminophen', image: '/Acetaminophen.jpg' },
  { title: 'clorfenamina', image: '/clorfenamina.jpg' },
  { title: 'alcacerxer', image: '/alcacerxer.png' },
  { title: 'sucrassyl', image: '/sucrassyl.png' },
  { title: 'intestinomicina', image: '/intestinomicina.png' },
  { title: 'advil', image: '/advil.avif' },
  { title: 'pepto bismol', image: '/pebtobismol.webp' },
  { title: 'vicks vaporub', image: '/vicks vaporub.jpg' },
  { title: 'amoxicilina', image: '/amoxicilina.jpg' },
  { title: 'virogrip', image: '/virogrip.webp' },
];

function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Por favor ingresa un término de búsqueda");
      return;
    }

    const results = sampleProducts.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (results.length === 0) {
      toast.error("Producto no encontrado");
    }

    setFilteredProducts(results);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setFilteredProducts(sampleProducts);
    }
  };

  return (
    <div className="products-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={handleInputChange}
        />
        <button className="search-btn" onClick={handleSearch}>Buscar</button>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product, index) => (
          <div className="product-card" key={index}>
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>
            <button className="buy-btn">Comprar</button>
          </div>
        ))}
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}

export default Products;
