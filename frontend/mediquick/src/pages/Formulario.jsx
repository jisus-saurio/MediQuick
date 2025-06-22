//import statements
import React, { useState } from 'react';
import '../style/Formulario.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//formulario componente
const Formulario = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return false;
    }
    if (!form.apellido.trim()) {
      toast.error("El apellido es obligatorio");
      return false;
    }
    if (!form.correo.trim()) {
      toast.error("El correo electrónico es obligatorio");
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.correo)) {
      toast.error("El correo electrónico no es válido");
      return false;
    }
    if (!form.mensaje.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      toast.success("Formulario enviado correctamente");
      // Aquí podrías enviar los datos con fetch o axios
      setForm({
        nombre: '',
        apellido: '',
        correo: '',
        mensaje: ''
      });
    }
  };

  return (
    <div className='form-container'>
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-orange-100 rounded-br-[200px] z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100 rounded-bl-[200px] z-0"></div>

        <div className="relative z-10 px-10 py-20 flex flex-col md:flex-row items-center gap-10">
          <form className="bg-white space-y-4 flex-1" onSubmit={handleSubmit}>
            <div className="flex gap-6">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-1/2 p-3 rounded-md shadow-md"
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={form.apellido}
                onChange={handleChange}
                className="w-1/2 p-3 rounded-md shadow-md"
              />
            </div>
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={form.correo}
              onChange={handleChange}
              className="w-full p-3 rounded-md shadow-md"
            />
            <textarea
              name="mensaje"
              placeholder="Mensaje"
              value={form.mensaje}
              onChange={handleChange}
              rows="5"
              className="w-full p-3 rounded-md shadow-md"
            ></textarea>
            <button
              type="submit"
              className="bg-orange-400 text-white px-6 py-2 rounded-md hover:bg-orange-500"
            >
              Enviar
            </button>
          </form>

          <div className="flex-1 h-64 w-full md:w-auto bg-gray-200 rounded-xl shadow-md"></div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Formulario;
