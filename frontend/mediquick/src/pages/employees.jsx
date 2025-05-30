//import statements
import React, { useEffect } from "react";
import "../style/Employees.css";
import { useEmployees } from "../hooks/useEmployees";

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

  // Render the component
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

         {// Modal para agregar/editar empleados
         } 
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingEmployeeId ? "Editar" : "Agregar"} Empleado</h2>
            <input name="name" placeholder="Nombre" value={newEmployee.name} onChange={handleChange} />
            <input name="surname" placeholder="Apellido" value={newEmployee.surname} onChange={handleChange} />
            <input name="email" placeholder="Email" value={newEmployee.email} onChange={handleChange} />
            <input name="position" placeholder="Posición" value={newEmployee.position} onChange={handleChange} />
            <input name="nurse_credential" placeholder="Credencial de Enfermería" value={newEmployee.nurse_credential} onChange={handleChange} />
            <div className="modal-buttons">
              <button onClick={saveEmployee}>
                {editingEmployeeId ? "Actualizar" : "Guardar"}
              </button>
              <button onClick={closeModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
