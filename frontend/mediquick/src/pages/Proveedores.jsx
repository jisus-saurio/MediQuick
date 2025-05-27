import React from "react";
import "../style/Proveedores.css"; // Asegúrate de tener este archivo CSS

const Proveedores = () => {
  const proveedores = [
    { id: 1, nombre: "Proveedor A", contacto: "123456789" },
    { id: 2, nombre: "Proveedor B", contacto: "987654321" },
    { id: 3, nombre: "Proveedor C", contacto: "456123789" },
    { id: 4, nombre: "Proveedor D", contacto: "321654987" },
  ];

  return (
    <div className="proveedores-container">
      {/* Simulación del Nav */}
      <div className="nav-simulador"></div>

      {/* Contenido principal */}
      <div className="contenido">
        <h1 className="titulo">Proveedores</h1>

        {/* Buscador */}
        <div className="buscador">
          <input type="text" placeholder="Buscar proveedor..." />
        </div>

        {/* Tabla de proveedores */}
        <div className="tabla">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((prov) => (
                <tr key={prov.id}>
                  <td>{prov.nombre}</td>
                  <td>{prov.contacto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botón agregar */}
        <button className="btn-agregar">Agregar</button>
      </div>
    </div>
  );
};

export default Proveedores;
