import React from "react";
import useCategories from "../hooks/useCategories";
import "../style/Categories.css";

const Categories = () => {
  const {
    categories,
    selectedCategory,
    name,
    description,
    error,
    showModal,
    setName,
    setDescription,
    setShowModal,
    handleSubmit,
    handleDelete,
    handleCardClick,
    handleAddClick,
  } = useCategories();

  return (
    <div className="categories-container">
      <div className="title-wrapper">
        <h1>Categorías</h1>
      </div>

      {error && <p className="error-message">{error}</p>}

      <ul className="categories-list">
        {categories.map((category) => (
          <li
            key={category._id}
            className="category-card"
            onClick={() => handleCardClick(category)}
          >
            <h2>{category.name}</h2>
            <p>{category.description}</p>
            <div className="card-actions">
              <button onClick={(e) => { e.stopPropagation(); handleCardClick(category); }}>
                Editar
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(category._id); }}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="btn-agregar-wrapper">
        <button className="btn-agregar" onClick={handleAddClick}>
          + Agregar categoría
        </button>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedCategory ? "Editar Categoría" : "Agregar Categoría"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre de la categoría"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit">
                  {selectedCategory ? "Actualizar" : "Agregar"}
                </button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
