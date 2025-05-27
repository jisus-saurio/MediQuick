import bcrypt from "bcryptjs";
import JsonWebTokenError from "jsonwebtoken";
import clientModel from "../models/customers.js"
import employeesModel from "../models/employee.js"
import { config } from "../config.js";
 
 
//Array de funciones
const loginController = {};
 
loginController.login = async (req, res) => {
    const {email, password} = req.body;
 
    try {
       
        let userFound; //Guardar el usuario encontrado
        let userType; //Guardar el tipo de usuario
 
        //Admin, Empleados y Clientes
        if(email === config.adminf.ADMIN_EMAIL && password === config.adminf.ADMIN_PASSWORD){0
            userType = "admin";
            userFound = {_id: "admin"};
        } else {
            //Empleado
            userFound = await employeesModel.findOne({email});
            userType = "employee";
 
            //Cliente
            if(!userFound){
                userFound = await clientModel.findOne({email})
                userType = "client"
            }
        }
        //Si no encuentra el usuario en ningún lado
        if(!userFound){
            return res.json({message: "user not found"})
        }
        //Desencriptar la contraseña si no es admin
        if(userType !== "admin"){
            const isMatch = bcrypt.compare(password, userFound.password)
            if(!isMatch){
                res.json({message: "Invalid password"})
            }
        }
 
        //TOKEN
        JsonWebTokenError.sign(
            //1.  ¿QUÉ VOY A GUARDAR?
            {id: userFound._id, userType},
            //2. Secreto
            config.JWT.SECRET,
            //3. ¿Cuándo expira?
            {expiresIn: config.JWT.EXPIRES},
            //4. Función flecha
            (error, token) => {
                if (error) console.log("error" + error);
                res.cookie("authToken", token);
                res.json({ message: "login successful" });
            }
        )
    } catch (error) {
        console.log("error" + error);
       
    }
}
 
export default loginController;