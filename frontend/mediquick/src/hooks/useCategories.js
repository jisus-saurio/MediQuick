import { useState, useEffect } from "react";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = selectedCategory ? "PUT" : "POST";
    const url = selectedCategory
      ? `/api/categories/${selectedCategory._id}`
      : "/api/categories";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error(
          selectedCategory
            ? "Error al actualizar la categoría"
            : "Error al agregar la categoría"
        );
      }

      setName("");
      setDescription("");
      setSelectedCategory(null);
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  };

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

  const handleCardClick = (category) => {
    setSelectedCategory(category);
    setName(category.name);
    setDescription(category.description);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setSelectedCategory(null);
    setName("");
    setDescription("");
    setShowModal(true);
  };

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
