import React, { useState, useEffect } from "react";
import "../style/Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    surname: "",
    email: "",
    position: "",
    nurse_credential: "",
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Token no encontrado. Usuario no autenticado.");
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Enfocar el primer input al abrir el modal
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        const firstInput = document.querySelector(".modal-content input");
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [isModalOpen]);

  const handleChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const openModal = (employee = null) => {
    if (employee) {
      setNewEmployee({
        name: employee.name || "",
        surname: employee.surname || "",
        email: employee.email || "",
        position: employee.position || "",
        nurse_credential: employee.nurse_credential || "",
      });
      setEditingEmployeeId(employee._id);
    } else {
      setNewEmployee({
        name: "",
        surname: "",
        email: "",
        position: "",
        nurse_credential: "",
      });
      setEditingEmployeeId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const toggleCard = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const saveEmployee = async () => {
    const method = editingEmployeeId ? "PUT" : "POST";
    const url = editingEmployeeId
      ? `/api/employees/${editingEmployeeId}`
      : "/api/employees";

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });
      fetchEmployees();
      closeModal();
    } catch (error) {
      console.error("Error al guardar empleado:", error);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchEmployees();
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
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
                <h3>
                  {employee.name} {employee.surname}
                </h3>
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
