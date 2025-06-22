//import statements
import React, { useEffect } from "react";
import "../style/Employees.css";
import { useEmployees } from "../hooks/useEmployees";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Employees componente
const Employees = () => {
  const {
    employees,
    newEmployee,
    isModalOpen,
    editingEmployeeId,
    expandedCardId,
    handleChange,
    openModal,
    closeModal,
    toggleCard,
    saveEmployee,
    deleteEmployee,
  } = useEmployees();

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        const firstInput = document.querySelector(".modal-content input");
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [isModalOpen]);

  const validate = () => {
    if (!newEmployee.name.trim()) {
      toast.error("El nombre es obligatorio");
      return false;
    }
    if (!newEmployee.surname.trim()) {
      toast.error("El apellido es obligatorio");
      return false;
    }
    if (!newEmployee.email.trim()) {
      toast.error("El correo electrónico es obligatorio");
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(newEmployee.email)) {
      toast.error("El correo electrónico no es válido");
      return false;
    }
    if (!newEmployee.position.trim()) {
      toast.error("La posición es obligatoria");
      return false;
    }
    if (!newEmployee.nurse_credential.trim()) {
      toast.error("La credencial de enfermería es obligatoria");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validate()) {
      saveEmployee();
      toast.success(editingEmployeeId ? "Empleado actualizado" : "Empleado agregado");
    }
  };

  return (
    <div className="empleados-container">
      <div className="contenido">
        <h1 className="titulo">Lista de Empleados</h1>

        <div className="scroll-area">
          {employees.map((employee) =>
            employee._id ? (
              <div
                className={`employee-card ${expandedCardId === employee._id ? "expanded" : ""}`}
                key={employee._id}
                onClick={() => toggleCard(employee._id)}
              >
                <h3>{employee.name} {employee.surname}</h3>
                <p>{employee.position}</p>

                {expandedCardId === employee._id && (
                  <div className="employee-details">
                    <p>Email: {employee.email}</p>
                    <p>Credencial: {employee.nurse_credential}</p>
                    <div className="card-actions">
                      <button onClick={() => openModal(employee)}>Editar</button>
                      <button onClick={() => deleteEmployee(employee._id)}>Eliminar</button>
                    </div>
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>

        <button className="btn-agregar" onClick={() => openModal()}>
          Agregar Empleado
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingEmployeeId ? "Editar" : "Agregar"} Empleado</h2>

            <input
              name="name"
              placeholder="Nombre"
              value={newEmployee.name}
              onChange={handleChange}
            />
            <input
              name="surname"
              placeholder="Apellido"
              value={newEmployee.surname}
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={handleChange}
            />
            <input
              name="position"
              placeholder="Posición"
              value={newEmployee.position}
              onChange={handleChange}
            />
            <input
              name="nurse_credential"
              placeholder="Credencial de Enfermería"
              value={newEmployee.nurse_credential}
              onChange={handleChange}
            />

            <div className="modal-buttons">
              <button onClick={handleSave}>
                {editingEmployeeId ? "Actualizar" : "Guardar"}
              </button>
              <button onClick={closeModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Employees;
