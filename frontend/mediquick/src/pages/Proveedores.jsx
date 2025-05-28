import React, { useState, useEffect } from "react";
import "../style/Proveedores.css";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [newProveedor, setNewProveedor] = useState({
    name: "",
    contact: "",
    phone: "",
  });
  const [editingProveedorId, setEditingProveedorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  const fetchProveedores = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/suppliers");
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleChange = (e) => {
    setNewProveedor({ ...newProveedor, [e.target.name]: e.target.value });
  };

  const openModal = (proveedor = null) => {
    if (proveedor) {
      setNewProveedor({
        name: proveedor.name || "",
        contact: proveedor.contact || "",
        phone: proveedor.phone || "",
      });
      setEditingProveedorId(proveedor._id);
    } else {
      setNewProveedor({ name: "", contact: "", phone: "" });
      setEditingProveedorId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const toggleCard = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const saveProveedor = async () => {
    const method = editingProveedorId ? "PUT" : "POST";
    const url = editingProveedorId
      ? `http://localhost:4000/api/suppliers/${editingProveedorId}`
      : "http://localhost:4000/api/suppliers";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProveedor),
      });
      fetchProveedores();
      closeModal();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
    }
  };

  const deleteProveedor = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/suppliers/${id}`, {
        method: "DELETE",
      });
      fetchProveedores();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
    }
  };

  return (
    <div className="proveedores-container">
      <div className="contenido">
        <h1 className="titulo">Lista de Proveedores</h1>

        <div className="scroll-area">
          {proveedores.map((proveedor) => (
            <div
              className="employee-card"
              key={proveedor._id}
              onClick={() => toggleCard(proveedor._id)}
            >
              <h3>{proveedor.name}</h3>
              <p>{proveedor.phone}</p>

              {expandedCardId === proveedor._id && (
                <div className="employee-details">
                  <p>Contacto: {proveedor.contact}</p>
                  <div className="card-actions">
                    <button onClick={() => openModal(proveedor)}>Editar</button>
                    <button onClick={() => deleteProveedor(proveedor._id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="btn-agregar" onClick={() => openModal()}>
          Agregar Proveedor
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingProveedorId ? "Editar" : "Agregar"} Proveedor</h2>
            <input
              name="name"
              placeholder="Nombre"
              value={newProveedor.name}
              onChange={handleChange}
            />
            <input
              name="contact"
              placeholder="Persona de contacto"
              value={newProveedor.contact}
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Teléfono"
              value={newProveedor.phone}
              onChange={handleChange}
            />
            <div className="modal-buttons">
              <button onClick={saveProveedor}>
                {editingProveedorId ? "Actualizar" : "Guardar"}
              </button>
              <button onClick={closeModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
