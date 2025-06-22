import React, { useState } from "react";
import "../style/FormularioProveedor.css";

const FormularioProveedor = () => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");

  const validarCorreo = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarTelefono = (tel) => /^\d{7,15}$/.test(tel);

  const handleAgregar = () => {
    if (!nombre || !correo || !telefono) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (!validarCorreo(correo)) {
      setError("El correo electrónico no es válido.");
      return;
    }

    if (!validarTelefono(telefono)) {
      setError("El teléfono debe tener solo números y entre 7 y 15 dígitos.");
      return;
    }

    setError("");
    alert("Proveedor agregado correctamente.");
    // Aquí iría la lógica para enviar datos a la API o base de datos

    // Limpiar campos
    setNombre("");
    setCorreo("");
    setTelefono("");
  };

  return (
    <div className="formulario-container">
      <div className="sidebar-placeholder"></div>

      <div className="form-content">
        <h1 className="titulo">Proveedores</h1>

        <div className="form-box">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Número de télefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button className="btn-agregar" onClick={handleAgregar}>
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioProveedor;
