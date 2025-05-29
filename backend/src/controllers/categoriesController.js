import CategoriesModels from "../models/Categories.js";

const categoriesController = {};

// SELECT: Obtener todas las categorías
categoriesController.getCategories = async (req, res) => {
  try {
    const categories = await CategoriesModels.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías", error });
  }
};

// INSERT: Crear una nueva categoría
categoriesController.createCategories = async (req, res) => {
  const { name, description } = req.body;

  // Validar los datos de entrada
  if (!name) {
    return res.status(400).json({ message: "El nombre es obligatorio" });
  }

  try {
    const newCategory = new CategoriesModels({ name, description });
    await newCategory.save();
    res.status(201).json({ message: "Categoría guardada", category: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar la categoría", error });
  }
};

// DELETE: Eliminar una categoría
categoriesController.deleteCategories = async (req, res) => {
  try {
    const deleteCategory = await CategoriesModels.findByIdAndDelete(req.params.id);
    if (!deleteCategory) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la categoría", error });
  }
};

// UPDATE: Actualizar una categoría
categoriesController.updateCategories = async (req, res) => {
  const { name, description } = req.body;

  try {
    const updateCategory = await CategoriesModels.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true } // runValidators para validar los datos
    );

    if (!updateCategory) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría actualizada", category: updateCategory });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la categoría", error });
  }
};

// SELECT: Obtener una categoría por ID
categoriesController.getCategorie = async (req, res) => {
  try {
    const categorie = await CategoriesModels.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la categoría", error });
  }
};

export default categoriesController;
