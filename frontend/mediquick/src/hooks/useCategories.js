import { useState, useEffect } from "react";

// Custom hook para manejar las categorías
const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Función para obtener las categorías desde la API
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Error al obtener categorías");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Efecto para cargar las categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, []);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = selectedCategory ? "PUT" : "POST";
    const url = selectedCategory
      ? `/api/categories/${selectedCategory._id}`
      : "/api/categories";

    // Validar campos  
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(
          selectedCategory
            ? "Error al actualizar la categoría"
            : "Error al agregar la categoría"
        );
      }

      // Limpiar el estado del formulario
      setName("");
      setDescription("");
      setSelectedCategory(null);
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  // Función para manejar la eliminación de una categoría
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Error al eliminar la categoría");
        fetchCategories();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Función para manejar el clic en una tarjeta de categoría
  const handleCardClick = (category) => {
    setSelectedCategory(category);
    setName(category.name);
    setDescription(category.description);
    setShowModal(true);
  };

  // Función para manejar el clic en el botón "Agregar categoría"
  const handleAddClick = () => {
    setSelectedCategory(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

  // Retornar los valores y funciones necesarias para el componente
  return {
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
  };
};

export default useCategories;
