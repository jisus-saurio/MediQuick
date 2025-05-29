//import statements
import React from "react";
import "../style/FormularioProveedor.css"; // Asegúrate de tener este archivo CSS

// formulario de proveedores componente
const FormularioProveedor = () => {
  return (
    <div className="formulario-container">
      <div className="sidebar-placeholder"></div>

      <div className="form-content">
        <h1 className="titulo">Proveedores</h1>

        <div className="form-box">
          <input type="text" placeholder="Nombre" />
          <input type="text" placeholder="Correo electrónico" />
          <input type="text" placeholder="Número de télefono" />


          <button className="btn-agregar">Agregar</button>
        </div>
      </div>
    </div>
  );
};

export default FormularioProveedor;
