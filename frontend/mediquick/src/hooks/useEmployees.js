import { useEffect, useState } from "react";

// Custom hook para manejar empleados
export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    surname: "",
    email: "",
    position: "",
    nurse_credential: "",
  });
  // Estado para manejar la edición y el modal
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  const token = localStorage.getItem("token");

  // Función para obtener los empleados desde la API
  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // Verificar si la respuesta es exitosa
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      setEmployees([]);
    }
  };

  // Efecto para cargar los empleados al montar el componente
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Función para manejar los cambios en el formulario
  const handleChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  // Funciones para abrir y cerrar el modal
  const openModal = (employee = null) => {
    if (employee) {
      setNewEmployee({ ...employee });
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

  // Función para cerrar el modal
  const closeModal = () => setIsModalOpen(false);

  const toggleCard = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };


  // Función para guardar un empleado (crear o actualizar)
  const saveEmployee = async () => {
    const method = editingEmployeeId ? "PUT" : "POST";
    const url = editingEmployeeId
      ? `/api/employees/${editingEmployeeId}`
      : "/api/employees";

    // Validar campos
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

  // Función para eliminar un empleado
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

  // Retornar los estados y funciones necesarias
  return {
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
  };
}
export default useEmployees;