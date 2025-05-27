import jsonwebtoken from 'jsonwebtoken';
import {config} from '../config.js';

export const validateAuthToken = (allowedUserTypes = []) => {


return (req, res, next) => {


    try {
        
        //extraer el token de la cookie
        const { authToken } = req.cookies;

        //imprimir un mensaje de error si no hay cookie
        if (!authToken) {
            return res.json({ message: 'No auth token found, please login first.' });
        }

        //extraer la información del token

        const decoded = jsonwebtoken.verify(authToken, config.JWT.SECRET);

        //verifcar si quien inicio sesion es un usaurio permitio

        if (!allowedUserTypes.includes(decoded.userType)) {
            return res.json({ message: 'You are not authorized to access this resource.' });
        }

        next();


    } catch (error) {
        console.log("error" + error);
        
        
    }

}


}