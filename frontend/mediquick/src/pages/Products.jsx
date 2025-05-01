import React from 'react';
import '../style/Products.css';

// Array de productos de ejemplo con título e imagen
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
  return (
    <div className="products-page"> {/* Contenedor principal de la página */}
      <div className="search-bar">  {/* Barra de búsqueda */}
        <input type="text" placeholder="Buscar productos..." /> {/* Campo de búsqueda */}
        <button className="search-btn">+</button> {/* Botón para la búsqueda (actualmente solo muestra un +) */}
      </div>
      <div className="product-grid"> {/* Contenedor de la cuadrícula de productos */}
        {sampleProducts.map((product, index) => (  // Mapea cada producto del array sampleProducts
          <div className="product-card" key={index}> {/* Tarjeta individual del producto */}
            <img src={product.image} alt={product.title} /> {/* Imagen del producto */}
            <h3>{product.title}</h3> {/* Título del producto */}
            <button className="buy-btn">Comprar</button> {/* Botón para comprar */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;  
