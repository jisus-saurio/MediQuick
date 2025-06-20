//imports
import React from 'react';
import '../style/AboutUs.css';

// AboutUs componente
const AboutUs = () => {
  return (
    <section className="about-us">
      <div className="about-banner">
        <h1>
          Bienvenido a <span className="text-orange">MEDI</span>
          <span className="text-blue">QUICK</span>
        </h1>
        <p className="about-description">
          En <strong>MediQuick</strong>, somos una farmacia en línea comprometida con tu salud. Ofrecemos medicamentos certificados, productos de cuidado personal y asesoría farmacéutica profesional, todo desde la comodidad de tu hogar.
          Con entregas rápidas y atención personalizada, tu bienestar es nuestra prioridad.
        </p>
      </div>

      <div className="about-content">
        <div className="image-layout">

          <div className="img-box circle large"> {/* Imagen 2 */} </div>
          <div className="img-box circle large"> {/* Imagen 3 */} </div>

          <div className="img-box circle large"> {/* Imagen 5 */} </div>


          <div className="img-box circle large"> {/* Imagen 8 */} </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
