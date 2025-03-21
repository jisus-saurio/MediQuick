// Aqui en el controlador, irán todos los metodos
// (C R U D)

const userController = {};

import  UsersModels from "../models/Users.js";

// SELECT
userController.getUsers = async (req, res) => {
  const user = await UsersModels.find();
  res.json(user);
};

// INSERT
userController.createUsers = async (req, res) => {
  const { name, email, password, address, phone} = req.body;

  const newUsers = new UsersModels({ name, email, password, address, phone });

  await newUsers.save();
  res.json({ message: "Producto guardado" });
};

// DELETE
userController.deleteUsers = async (req, res) => {
  const deleteUsers = await UsersModels.findByIdAndDelete(req.params.id);
  res.json({ message: "Producto eliminado" });
};

// UPDATE
userController.updateUsers = async (req, res) => {
  const { name, email, password, address, phone } = req.body;
  const updateUsers = await UsersModels.findByIdAndUpdate(
    req.params.id,
    { name, email, password, address, phone },
    { new: true }
  );

  res.json({ message: "producto actualizado" });
};

// SELECT 1 PRODUCT BY ID
userController.getUser = async (req, res) => {
  const users = await UsersModels.findById(req.params.id);
  res.json(users);
};

export default userController;
