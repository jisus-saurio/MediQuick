import bcrypt from "bcryptjs";
import pkg from "jsonwebtoken";
const { sign } = pkg;
import clientModel from "../models/Users.js";
import employeesModel from "../models/Employees.js";
import { config } from "../config.js";

const loginController = {};

loginController.login = async (req, res) => {
    console.log("Cuerpo de la solicitud:", req.body);

    const { email, password } = req.body;

    try {
        let userFound;
        let userType;

        // Verificación de administrador
        if (email === config.adminf.ADMIN_EMAIL && password === config.adminf.ADMIN_PASSWORD) {
            userType = "Admin";
            userFound = { _id: "Admin" };
        } else {
            // Buscar empleado
            userFound = await employeesModel.findOne({ email });
            if (userFound) {
                userType = "Employee";
            } else {
                // Buscar cliente
                userFound = await clientModel.findOne({ email });
                if (userFound) {
                    userType = "User";
                }
            }
        }

        if (!userFound) {
            return res.status(401).json({ message: "User not found", success: false });
        }

        // Validar contraseña si no es Admin
        if (userType !== "Admin") {
            const isMatch = await bcrypt.compare(password, userFound.password);
            console.log("Contraseña real:", userFound.password);
            console.log("Contraseña ingresada:", password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid password", success: false });
            }
        }

        // Validar y formatear expiresIn
        let expiresIn = config.JWT.EXPIRES;
        console.log("Valor de expiresIn desde config:", expiresIn);

        // Validar si viene como string numérico (ej. "3600"), convertir a número
        if (!expiresIn || (isNaN(expiresIn) && typeof expiresIn !== "string")) {
            console.error("JWT_EXPIRES inválido:", expiresIn);
            return res.status(500).json({ message: "Invalid expiresIn value", success: false });
        }


        // Generar token
        sign(
            { id: userFound._id, userType },
            config.JWT.SECRET,
            { expiresIn },
            (error, token) => {
                if (error) {
                    console.error("Error generando el token:", error);
                    return res.status(500).json({ message: "Error generating token", success: false });
                }

                res.cookie("authToken", token, { httpOnly: true });
                console.log("Valor leído de config.JWT.EXPIRES:", config.JWT.EXPIRES);


                return res.json({
                    message: "Login successful",
                    success: true,
                    userType,
                    redirectTo: userType === "User" ? "/" : "/HomeAdmin"
                });
            }
        );

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Server error", success: false });
    }
};

export default loginController;
