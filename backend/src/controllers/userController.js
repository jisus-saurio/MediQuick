// Aqui en el controlador, irán todos los metodos
// (C R U D)

const userController = {};

import UsersModels from "../models/Users.js";
import bcrypt from "bcryptjs";

// SELECT - Funciona con o sin autenticación
userController.getUsers = async (req, res) => {
  try {
    console.log('GET /users - req.user:', req.user ? 'Autenticado' : 'No autenticado');
    
    // Si no hay autenticación, devolver solo datos básicos para el sistema de login
    if (!req.user) {
      console.log('Devolviendo datos públicos para sistema de login');
      const users = await UsersModels.find({}, 'email _id name');
      return res.json(users);
    }
    
    // Si hay autenticación, devolver datos según permisos
    if (req.user.userType === 'Admin' || req.user.userType === 'Employee') {
      console.log('Usuario admin/empleado - devolviendo todos los datos');
      const users = await UsersModels.find();
      return res.json(users);
    } else {
      console.log('Usuario normal - devolviendo solo sus datos');
      const user = await UsersModels.findById(req.user.id);
      return res.json([user]);
    }
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: "Error del servidor", success: false });
  }
};

// INSERT - COMPLETAMENTE PÚBLICO para permitir registro
userController.createUsers = async (req, res) => {
  try {
    console.log('POST /users - Creando nuevo usuario');
    console.log('Datos recibidos:', { ...req.body, password: '***' });
    
    const { name, email, password, address, phone } = req.body;

    // Validaciones básicas
    if (!name || !email || !password || !address || !phone) {
      console.log('❌ Campos faltantes');
      return res.status(400).json({ 
        message: "Todos los campos son obligatorios",
        success: false 
      });
    }

    // Verificar si el email ya existe
    const existingUser = await UsersModels.findOne({ email });
    if (existingUser) {
      console.log('❌ Email ya existe:', email);
      return res.status(400).json({ 
        message: "El email ya está registrado",
        success: false 
      });
    }

    // Validar formato de email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email inválido:', email);
      return res.status(400).json({ 
        message: "Formato de email inválido",
        success: false 
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log('❌ Contraseña muy corta');
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres",
        success: false 
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Contraseña hasheada');

    // Crear nuevo usuario
    const newUser = new UsersModels({ 
      name, 
      email, 
      password: hashedPassword, 
      address, 
      phone 
    });

    const savedUser = await newUser.save();
    
    console.log('✅ Usuario creado exitosamente:', savedUser._id);

    res.status(201).json({ 
      message: "Usuario registrado exitosamente",
      success: true,
      userId: savedUser._id
    });

  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "El email ya está registrado",
        success: false 
      });
    }
    
    res.status(500).json({ 
      message: "Error del servidor al crear usuario",
      success: false 
    });
  }
};

// DELETE - Solo para admins y empleados
userController.deleteUsers = async (req, res) => {
  try {
    // Verificar autorización
    if (!req.user || !['Admin', 'Employee'].includes(req.user.userType)) {
      return res.status(403).json({ 
        message: "No tienes autorización para eliminar usuarios",
        success: false 
      });
    }

    const deletedUser = await UsersModels.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ 
        message: "Usuario no encontrado",
        success: false 
      });
    }

    res.json({ 
      message: "Usuario eliminado exitosamente",
      success: true 
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ 
      message: "Error del servidor",
      success: false 
    });
  }
};

// UPDATE - Solo el propio usuario o admins/empleados
userController.updateUsers = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const targetUserId = req.params.id;

    // Verificar autorización
    if (!req.user) {
      return res.status(401).json({ 
        message: "Debes iniciar sesión para actualizar información",
        success: false 
      });
    }

    // Solo el propio usuario o admin/empleado pueden actualizar
    if (req.user.id !== targetUserId && !['Admin', 'Employee'].includes(req.user.userType)) {
      return res.status(403).json({ 
        message: "No tienes autorización para actualizar este usuario",
        success: false 
      });
    }

    // Preparar datos de actualización
    const updateData = { name, email, address, phone };

    // Solo actualizar contraseña si se proporciona una nueva
    if (password && password !== '********' && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ 
          message: "La contraseña debe tener al menos 6 caracteres",
          success: false 
        });
      }
      
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await UsersModels.findByIdAndUpdate(
      targetUserId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        message: "Usuario no encontrado",
        success: false 
      });
    }

    // No devolver la contraseña
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({ 
      message: "Usuario actualizado exitosamente",
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "El email ya está en uso por otro usuario",
        success: false 
      });
    }
    
    res.status(500).json({ 
      message: "Error del servidor",
      success: false 
    });
  }
};

// SELECT 1 USER BY ID - Solo el propio usuario o admins/empleados
userController.getUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Verificar autorización
    if (!req.user) {
      return res.status(401).json({ 
        message: "Debes iniciar sesión para acceder a esta información",
        success: false 
      });
    }

    // Solo el propio usuario o admin/empleado pueden ver los datos
    if (req.user.id !== targetUserId && !['Admin', 'Employee'].includes(req.user.userType)) {
      return res.status(403).json({ 
        message: "No tienes autorización para ver este usuario",
        success: false 
      });
    }

    const user = await UsersModels.findById(targetUserId);
    
    if (!user) {
      return res.status(404).json({ 
        message: "Usuario no encontrado",
        success: false 
      });
    }

    // No devolver la contraseña
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ 
      message: "Error del servidor",
      success: false 
    });
  }
};

export default userController;