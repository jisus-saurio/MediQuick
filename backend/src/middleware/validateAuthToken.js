import jsonwebtoken from 'jsonwebtoken';
import { config } from '../config.js';

// Middleware que REQUIERE autenticación
export const validateAuthToken = (allowedUserTypes = []) => {
    return (req, res, next) => {
        try {
            console.log('🔒 Validando token requerido...');
            
            // Extraer el token de la cookie
            const { authToken } = req.cookies;

            // Error si no hay cookie
            if (!authToken) {
                console.log('❌ No hay token en cookies');
                return res.status(401).json({ 
                    message: 'No se encontró token de autenticación, por favor inicie sesión.',
                    success: false,
                    requiresAuth: true
                });
            }

            // Verificar el token
            const decoded = jsonwebtoken.verify(authToken, config.JWT.SECRET);
            console.log('✅ Token válido:', decoded.userType);

            // Verificar permisos si se especificaron
            if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(decoded.userType)) {
                console.log('❌ Permisos insuficientes');
                return res.status(403).json({ 
                    message: 'No tienes autorización para acceder a este recurso.',
                    success: false,
                    userType: decoded.userType
                });
            }

            // Agregar información del usuario al request
            req.user = {
                id: decoded.id,
                userType: decoded.userType,
                email: decoded.email
            };

            console.log('✅ Usuario autenticado:', req.user);
            next();

        } catch (error) {
            console.log("❌ Error en validación de token:", error.message);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Token expirado, por favor inicie sesión nuevamente.',
                    success: false,
                    expired: true
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: 'Token inválido.',
                    success: false
                });
            }

            return res.status(500).json({ 
                message: 'Error del servidor al validar autenticación.',
                success: false
            });
        }
    }
}

// Middleware que NO requiere autenticación (opcional)
export const optionalAuth = (req, res, next) => {
    try {
        console.log('🔓 Verificando autenticación opcional...');
        
        const { authToken } = req.cookies;
        
        if (authToken) {
            try {
                const decoded = jsonwebtoken.verify(authToken, config.JWT.SECRET);
                req.user = {
                    id: decoded.id,
                    userType: decoded.userType,
                    email: decoded.email
                };
                console.log('✅ Usuario encontrado (opcional):', req.user.userType);
            } catch (error) {
                console.log('⚠️ Token inválido o expirado, continuando sin autenticación');
                req.user = null;
            }
        } else {
            console.log('ℹ️ No hay token, continuando sin autenticación');
            req.user = null;
        }
        
        next();
        
    } catch (error) {
        console.log("⚠️ Error en autenticación opcional, continuando sin autenticación:", error.message);
        req.user = null;
        next();
    }
}