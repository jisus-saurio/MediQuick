import React, { useState, useEffect } from 'react';
import '../style/home.css'; // Importa los estilos CSS actualizados

// Importa las imágenes usadas en el home
import banner1 from '../img/banner1.jpg';
import banner2 from '../img/banner2.jpg';
import banner3 from '../img/banner3.jpg';
import frascos from '../img/frascos.png';
import cat2 from '../img/pastillas.jpg';
import cat3 from '../img/cremas.jpg';
import prod1 from '../img/prod1.jpg';
import prod2 from '../img/prod2.jpg';
import prod3 from '../img/prod3.webp';

function Home() {
  const [currentImage, setCurrentImage] = useState(0); // Estado para controlar qué imagen se muestra en el carrusel

  const images = [banner1, banner2, banner3]; // Array con las imágenes del carrusel

  useEffect(() => {
    // Configura un intervalo para cambiar la imagen cada 4 segundos
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  }, [images.length]);

  return (
    <div className="home-container"> {/* Contenedor principal de la página Home */}

      {/* Carrusel de banners */}
      <section className="banner">
        <img src={images[currentImage]} alt="Banner" className="banner-image" />
      </section>

      {/* Sección de categorías */}
      <h2 className="section-title">Categorías</h2>
      <section className="icons">
        <div className="circle">
          <img src={frascos} alt="Categoría 1" className="circle-image" />
        </div>
        <div className="circle">
          <img src={cat2} alt="Categoría 2" className="circle-image" />
        </div>
        <div className="circle">
          <img src={cat3} alt="Categoría 3" className="circle-image" />
        </div>
      </section>

      {/* Sección de productos destacados */}
      <h2 className="section-title">Productos</h2>
      <section className="cards">
        <div className="card">
          <img src={prod1} alt="Producto 1" className="card-image" />
        </div>
        <div className="card">
          <img src={prod2} alt="Producto 2" className="card-image" />
        </div>
        <div className="card">
          <img src={prod3} alt="Producto 3" className="card-image" />
        </div>
      </section>
    </div>
  );
}

export default Home; // Exporta el componente para poder usarlo en otras partes de la aplicación
