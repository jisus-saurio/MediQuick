import bcrypt from "bcryptjs";
import UsersModels from "../models/Users.js";
import employeesModel from "../models/Employees.js";
import { sendEmail, HTMLRecoveryEmail } from "../utils/mailRecoveryPassword.js";

const passwordRecoveryController = {};

const verificationCodes = new Map();

// Generar código de 6 dígitos
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar código de recuperación
passwordRecoveryController.sendRecoveryCode = async (req, res) => {
    try {
        console.log('🔐 Iniciando proceso de recuperación de contraseña');
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email es requerido",
                success: false
            });
        }

        // Buscar usuario (cliente o empleado)
        let userFound = await UsersModels.findOne({ email });
        let userType = "User";

        if (!userFound) {
            userFound = await employeesModel.findOne({ email });
            userType = "Employee";
        }

        if (!userFound) {
            console.log('❌ Usuario no encontrado:', email);
            return res.status(404).json({
                message: "No se encontró una cuenta con este email",
                success: false
            });
        }

        // Generar código de verificación
        const verificationCode = generateVerificationCode();
        const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutos

        // Guardar código temporalmente
        verificationCodes.set(email, {
            code: verificationCode,
            expiresAt: expirationTime,
            userId: userFound._id.toString(),
            userType,
            attempts: 0
        });

        console.log('📧 Enviando código de recuperación a:', email);

        // Enviar email
        const emailSent = await sendEmail(
            email,
            "Código de Recuperación de Contraseña - MediQuick",
            `Tu código de recuperación es: ${verificationCode}`,
            HTMLRecoveryEmail(verificationCode)
        );

        if (emailSent) {
            console.log('✅ Email enviado exitosamente');
            res.json({
                message: "Código de recuperación enviado a tu email",
                success: true
            });
        } else {
            console.log('❌ Error enviando email');
            res.status(500).json({
                message: "Error enviando el código de recuperación",
                success: false
            });
        }

    } catch (error) {
        console.error('❌ Error en sendRecoveryCode:', error);
        res.status(500).json({
            message: "Error del servidor",
            success: false
        });
    }
};

// Verificar código de recuperación
passwordRecoveryController.verifyRecoveryCode = async (req, res) => {
    try {
        console.log('🔍 Verificando código de recuperación');
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                message: "Email y código son requeridos",
                success: false
            });
        }

        const storedData = verificationCodes.get(email);

        if (!storedData) {
            return res.status(400).json({
                message: "No hay código de recuperación pendiente para este email",
                success: false
            });
        }

        // Verificar expiración
        if (Date.now() > storedData.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({
                message: "El código de recuperación ha expirado",
                success: false
            });
        }

        // Incrementar intentos
        storedData.attempts += 1;

        // Máximo 3 intentos
        if (storedData.attempts > 3) {
            verificationCodes.delete(email);
            return res.status(429).json({
                message: "Demasiados intentos. Solicita un nuevo código",
                success: false
            });
        }

        // Verificar código
        if (storedData.code !== code) {
            return res.status(400).json({
                message: `Código incorrecto. Intentos restantes: ${4 - storedData.attempts}`,
                success: false
            });
        }

        console.log('✅ Código verificado correctamente');

        // Código correcto - generar token temporal para cambio de contraseña
        const resetToken = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);

        // Actualizar datos almacenados con token
        verificationCodes.set(email, {
            ...storedData,
            resetToken,
            codeVerified: true,
            expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutos para cambiar contraseña
        });

        res.json({
            message: "Código verificado correctamente",
            success: true,
            resetToken
        });

    } catch (error) {
        console.error('❌ Error en verifyRecoveryCode:', error);
        res.status(500).json({
            message: "Error del servidor",
            success: false
        });
    }
};

// Restablecer contraseña
passwordRecoveryController.resetPassword = async (req, res) => {
    try {
        console.log('🔄 Restableciendo contraseña');
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                message: "Email, token y nueva contraseña son requeridos",
                success: false
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 6 caracteres",
                success: false
            });
        }

        const storedData = verificationCodes.get(email);

        if (!storedData || !storedData.codeVerified || storedData.resetToken !== resetToken) {
            return res.status(400).json({
                message: "Token de restablecimiento inválido",
                success: false
            });
        }

        // Verificar expiración
        if (Date.now() > storedData.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({
                message: "El token de restablecimiento ha expirado",
                success: false
            });
        }

        // Hashear nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña en la base de datos
        let updateResult;
        if (storedData.userType === "User") {
            updateResult = await UsersModels.findByIdAndUpdate(
                storedData.userId,
                { password: hashedPassword },
                { new: true }
            );
        } else {
            updateResult = await employeesModel.findByIdAndUpdate(
                storedData.userId,
                { password: hashedPassword },
                { new: true }
            );
        }

        if (!updateResult) {
            return res.status(404).json({
                message: "Usuario no encontrado",
                success: false
            });
        }

        // Limpiar código de verificación
        verificationCodes.delete(email);

        console.log('✅ Contraseña actualizada exitosamente para:', email);

        res.json({
            message: "Contraseña actualizada exitosamente",
            success: true
        });

    } catch (error) {
        console.error('❌ Error en resetPassword:', error);
        res.status(500).json({
            message: "Error del servidor",
            success: false
        });
    }
};

export default passwordRecoveryController;