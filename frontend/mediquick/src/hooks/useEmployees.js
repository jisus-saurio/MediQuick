import { useEffect, useState } from "react";

export function useEmployees() {
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

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

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
