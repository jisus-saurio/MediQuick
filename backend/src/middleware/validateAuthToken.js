import jsonwebtoken from 'jsonwebtoken';
import {config} from '../config.js';

export const validateAuthToken = (allowedUserTypes = []) => {
    return (req, res, next) => {
        try {
            // Extraer el token de la cookie
            const { authToken } = req.cookies;

            // Imprimir un mensaje de error si no hay cookie
            if (!authToken) {
                return res.status(401).json({ 
                    message: 'No se encontró token de autenticación, por favor inicie sesión.',
                    success: false,
                    requiresAuth: true
                });
            }

            // Extraer la información del token
            const decoded = jsonwebtoken.verify(authToken, config.JWT.SECRET);

            // Verificar si quien inició sesión es un usuario permitido
            if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(decoded.userType)) {
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

            next();

        } catch (error) {
            console.log("Error en validación de token:", error);
            
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

export const optionalAuth = (req, res, next) => {
    try {
        const { authToken } = req.cookies;
        
        if (authToken) {
            const decoded = jsonwebtoken.verify(authToken, config.JWT.SECRET);
            req.user = {
                id: decoded.id,
                userType: decoded.userType,
                email: decoded.email
            };
        }
        // Si no hay token, simplemente continúa sin req.user
        next();
        
    } catch (error) {
        // Si hay error en el token, continúa sin autenticación
        console.log("Token inválido o expirado, continuando sin autenticación");
        next();
    }
}