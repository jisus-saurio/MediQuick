/* 
name
 surname
    email
    position
    surname
    nurse_credential
*/

import { Schema, model } from "mongoose";

const EmployeesSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  nurse_credential: { type: String, required: true },
});

export default model("Employees", EmployeesSchema);
