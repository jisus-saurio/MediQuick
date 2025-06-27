import bcrypt from "bcryptjs";
import clientModel from "../models/Users.js";
import emailService from "../services/emailService.js";

const verificationController = {};

// Almacén temporal para códigos de verificación (en producción usar Redis)
const verificationCodes = new Map();

verificationController.sendVerificationCode = async (req, res) => {
    console.log("=== ENVÍO DE CÓDIGO DE VERIFICACIÓN ===");
    console.log("Datos recibidos:", req.body);

    const { name, email, password, address, phone } = req.body;

    // Validación básica
    if (!name || !email || !password || !address || !phone) {
        return res.status(400).json({
            message: "Todos los campos son obligatorios",
            success: false
        });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await clientModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "Ya existe una cuenta con este email",
                success: false
            });
        }

        // Generar código de verificación
        const verificationCode = emailService.generateVerificationCode();
        console.log("Código generado:", verificationCode);

        // Hashear la contraseña para almacenar temporalmente
        const hashedPassword = await bcrypt.hash(password, 10);

        // Almacenar datos temporalmente (incluye código y datos del usuario)
        const tempUserData = {
            name,
            email,
            password: hashedPassword,
            address,
            phone,
            code: verificationCode,
            createdAt: new Date(),
            attempts: 0
        };

        verificationCodes.set(email, tempUserData);
        console.log("Datos temporales almacenados para:", email);

        // Limpiar código después de 10 minutos
        setTimeout(() => {
            if (verificationCodes.has(email)) {
                verificationCodes.delete(email);
                console.log("Código expirado eliminado para:", email);
            }
        }, 10 * 60 * 1000); // 10 minutos

        // Enviar email de verificación
        const emailResult = await emailService.sendVerificationEmail(email, verificationCode, name);

        if (emailResult.success) {
            console.log("✅ Código enviado exitosamente a:", email);
            res.json({
                message: "Código de verificación enviado a tu email",
                success: true,
                email: email
            });
        } else {
            // Limpiar datos si falló el envío del email
            verificationCodes.delete(email);
            console.error("❌ Error enviando email:", emailResult.error);
            res.status(500).json({
                message: "Error enviando el código de verificación. Intenta nuevamente.",
                success: false
            });
        }

    } catch (error) {
        console.error("❌ Error en sendVerificationCode:", error);
        res.status(500).json({
            message: "Error del servidor",
            success: false
        });
    }
};

verificationController.verifyCode = async (req, res) => {
    console.log("=== VERIFICACIÓN DE CÓDIGO ===");
    console.log("Datos recibidos:", req.body);

    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({
            message: "Email y código son requeridos",
            success: false
        });
    }

    try {
        // Buscar datos temporales
        const tempData = verificationCodes.get(email);
        
        if (!tempData) {
            console.log("❌ No se encontraron datos temporales para:", email);
            return res.status(400).json({
                message: "Código expirado o no válido. Solicita un nuevo código.",
                success: false,
                expired: true
            });
        }

        // Verificar intentos
        if (tempData.attempts >= 3) {
            verificationCodes.delete(email);
            console.log("❌ Demasiados intentos fallidos para:", email);
            return res.status(429).json({
                message: "Demasiados intentos fallidos. Solicita un nuevo código.",
                success: false,
                tooManyAttempts: true
            });
        }

        // Verificar código
        if (tempData.code !== code.trim()) {
            tempData.attempts += 1;
            console.log(`❌ Código incorrecto para ${email}. Intento ${tempData.attempts}/3`);
            return res.status(400).json({
                message: `Código incorrecto. Te quedan ${3 - tempData.attempts} intentos.`,
                success: false,
                attemptsLeft: 3 - tempData.attempts
            });
        }

        console.log("✅ Código verificado correctamente para:", email);

        // Crear usuario en la base de datos
        const newUser = new clientModel({
            name: tempData.name,
            email: tempData.email,
            password: tempData.password, // Ya está hasheada
            address: tempData.address,
            phone: tempData.phone,
            verified: true,
            createdAt: new Date()
        });

        const savedUser = await newUser.save();
        console.log("✅ Usuario creado exitosamente:", savedUser._id);

        // Limpiar datos temporales
        verificationCodes.delete(email);

        // Enviar email de bienvenida
        emailService.sendWelcomeEmail(email, tempData.name).catch(error => {
            console.warn("⚠️ Error enviando email de bienvenida:", error);
        });

        res.json({
            message: "Cuenta verificada y creada exitosamente",
            success: true,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone,
                address: savedUser.address
            }
        });

    } catch (error) {
        console.error("❌ Error en verifyCode:", error);
        
        // Error específico de duplicado
        if (error.code === 11000) {
            verificationCodes.delete(email);
            return res.status(409).json({
                message: "Ya existe una cuenta con este email",
                success: false
            });
        }

        res.status(500).json({
            message: "Error del servidor al verificar el código",
            success: false
        });
    }
};

verificationController.resendCode = async (req, res) => {
    console.log("=== REENVÍO DE CÓDIGO ===");
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email es requerido",
            success: false
        });
    }

    try {
        const tempData = verificationCodes.get(email);
        
        if (!tempData) {
            return res.status(400).json({
                message: "No hay un proceso de registro activo para este email",
                success: false
            });
        }

        // Generar nuevo código
        const newCode = emailService.generateVerificationCode();
        
        // Actualizar datos temporales
        tempData.code = newCode;
        tempData.attempts = 0; // Resetear intentos
        tempData.createdAt = new Date(); // Actualizar tiempo
        
        verificationCodes.set(email, tempData);

        // Reenviar email
        const emailResult = await emailService.sendVerificationEmail(email, newCode, tempData.name);

        if (emailResult.success) {
            console.log("✅ Código reenviado exitosamente a:", email);
            res.json({
                message: "Nuevo código enviado a tu email",
                success: true
            });
        } else {
            console.error("❌ Error reenviando email:", emailResult.error);
            res.status(500).json({
                message: "Error reenviando el código. Intenta nuevamente.",
                success: false
            });
        }

    } catch (error) {
        console.error("❌ Error en resendCode:", error);
        res.status(500).json({
            message: "Error del servidor",
            success: false
        });
    }
};

// Función para limpiar códigos expirados (opcional, para uso manual)
verificationController.cleanupExpiredCodes = () => {
    const now = new Date();
    const expiredEmails = [];
    
    verificationCodes.forEach((data, email) => {
        const timeDiff = now - new Date(data.createdAt);
        if (timeDiff > 10 * 60 * 1000) { // 10 minutos
            expiredEmails.push(email);
        }
    });
    
    expiredEmails.forEach(email => {
        verificationCodes.delete(email);
        console.log("Código expirado eliminado manualmente:", email);
    });
    
    return expiredEmails.length;
};

export default verificationController;