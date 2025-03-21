// Aqui en el controlador, irán todos los metodos
// (C R U D)

const categoriesController = {};

import  CategoriesModels from "../models/Categories.js";

// SELECT
categoriesController.getCategories = async (req, res) => {
  const categories = await CategoriesModels.find();
  res.json(categories);
};

// INSERT
categoriesController.createCategories = async (req, res) => {
  const { name, description} = req.body;

  const newEmployees = new CategoriesModels({ name, description });

  await newEmployees.save();
  res.json({ message: "Producto guardado" });
};

// DELETE
categoriesController.deleteCategories = async (req, res) => {
  const deleteEmployees = await CategoriesModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Producto eliminado" });
};

// UPDATE
categoriesController.updateCategories = async (req, res) => {
  const { name, description } = req.body;
  const updateEmployees = await CategoriesModels.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true }
  );

  res.json({ message: "producto actualizado" });
};

// SELECT 1 PRODUCT BY ID
categoriesController.getCategorie = async (req, res) => {
  const categorie = await CategoriesModels.findById(req.params.id);
  res.json(categorie);
};

export default categoriesController;