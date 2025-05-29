//import statements
import React from 'react';
import '../style/Formulario.css';


//formulario componente
const Formulario = () => {
  return (
    <div className='form-container'>


      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-orange-100 rounded-br-[200px] z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100 rounded-bl-[200px] z-0"></div>

        <div className="relative z-10 px-10 py-20 flex flex-col md:flex-row items-center gap-10">
          <form className="bg-white space-y-4 flex-1">
            <div className="flex gap-6">
              <input type="text" placeholder="Nombre" className="w-1/2 p-3 rounded-md shadow-md" />
              <input type="text" placeholder="Apellido" className="w-1/2 p-3 rounded-md shadow-md" />
            </div>
            <input type="email" placeholder="Correo electrónico" className="w-full p-3 rounded-md shadow-md" />
            <textarea placeholder="Mensaje" rows="5" className="w-full p-3 rounded-md shadow-md"></textarea>
            <button type="submit" className="bg-orange-400 text-white px-6 py-2 rounded-md hover:bg-orange-500">
              Enviar
            </button>
          </form>

          <div className="flex-1 h-64 w-full md:w-auto bg-gray-200 rounded-xl shadow-md"></div>
        </div>
      </div>
    </div>
  );
};

export default Formulario;