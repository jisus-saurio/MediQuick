import bcrypt from "bcryptjs";
import pkg from "jsonwebtoken";
const { sign } = pkg;
import clientModel from "../models/Users.js";
import employeesModel from "../models/Employees.js";
import { config } from "../config.js";

const loginController = {};

loginController.login = async (req, res) => {
    console.log("=== INICIO LOGIN ===");
    console.log("Cuerpo de la solicitud:", req.body);

    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
        console.log("❌ Email o password faltantes");
        return res.status(400).json({ 
            message: "Email y contraseña son requeridos", 
            success: false 
        });
    }

    try {
        let userFound;
        let userType;
        let redirectTo;

        console.log("🔍 Buscando usuario:", email);

        // Verificación de administrador
        if (email === config.adminf.ADMIN_EMAIL && password === config.adminf.ADMIN_PASSWORD) {
            console.log("✅ Login como ADMIN");
            userType = "Admin";
            userFound = { _id: "Admin", email: email };
            redirectTo = "/HomeAdmind";
        } else {
            // Buscar empleado
            userFound = await employeesModel.findOne({ email });
            if (userFound) {
                userType = "Employee";
                redirectTo = "/HomeAdmind";
                console.log("✅ Usuario encontrado como EMPLEADO");
            } else {
                // Buscar cliente
                userFound = await clientModel.findOne({ email });
                if (userFound) {
                    userType = "User";
                    redirectTo = "/";
                    console.log("✅ Usuario encontrado como CLIENTE");
                }
            }
        }

        if (!userFound) {
            console.log("❌ Usuario no encontrado");
            return res.status(401).json({ 
                message: "Usuario no encontrado", 
                success: false 
            });
        }

        // Validar contraseña si no es Admin
        if (userType !== "Admin") {
            console.log("🔒 Validando contraseña...");
            console.log("Contraseña en BD:", userFound.password);
            
            // Verificar si la contraseña está hasheada o es texto plano
            const isHashed = userFound.password.startsWith('$2');
            console.log("¿Contraseña está hasheada?", isHashed ? "SÍ" : "NO - TEXTO PLANO");
            
            let isMatch = false;
            
            if (isHashed) {
                // Contraseña hasheada - usar bcrypt
                isMatch = await bcrypt.compare(password, userFound.password);
                console.log("Comparación con bcrypt:", isMatch ? "✅" : "❌");
            } else {
                // Contraseña en texto plano - comparación directa
                isMatch = password === userFound.password;
                console.log("Comparación directa:", isMatch ? "✅" : "❌");
                
                if (isMatch) {
                    console.log("⚠️ ADVERTENCIA: Contraseña en texto plano detectada");
                }
            }

            if (!isMatch) {
                return res.status(401).json({ 
                    message: "Contraseña incorrecta", 
                    success: false 
                });
            }
        }

        // Validar configuración JWT
        let expiresIn = config.JWT.EXPIRES || "1h";
        console.log("🔑 Generando token JWT...");

        if (!config.JWT.SECRET) {
            console.error("❌ JWT_SECRET no configurado");
            return res.status(500).json({ 
                message: "Error de configuración del servidor", 
                success: false 
            });
        }

        // Generar token
        sign(
            { 
                id: userFound._id, 
                userType,
                email: userFound.email || email 
            },
            config.JWT.SECRET,
            { expiresIn },
            (error, token) => {
                if (error) {
                    console.error("❌ Error generando token:", error);
                    return res.status(500).json({ 
                        message: "Error generating token", 
                        success: false 
                    });
                }

                console.log("✅ Token generado exitosamente");

                // Configurar cookie
                res.cookie("authToken", token, { 
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600000 // 1 hora
                });

                console.log("🚀 Login exitoso, redirigiendo a:", redirectTo);
                console.log("=== FIN LOGIN ===");

                return res.json({
                    message: "Inicio de sesión exitoso",
                    success: true,
                    userType,
                    redirectTo,
                    user: {
                        id: userFound._id,
                        email: userFound.email || email,
                        userType
                    }
                });
            }
        );

    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({ 
            message: "Error del servidor", 
            success: false 
        });
    }
};

export default loginController;