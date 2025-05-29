//import statements
import React, { useState, useEffect } from "react";
import "../style/AddProductos.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// AddProducts componente
const AddProducts = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [producto, setProducto] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    supplierId: "",
    image: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchProveedores();
  }, []);

  // Fetch products  
  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      const productList = Array.isArray(data) ? data : data.products || [];
      setProductos(productList);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setProductos([]);
    }
  };

  // Fetch categories 
  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      setCategorias([]);
    }
  };
  // Fetch suppliers 
  const fetchProveedores = async () => {
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      setProveedores([]);
    }
  };

  // Handle changes 
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setProducto({ ...producto, image: files[0] });
    } else {
      setProducto({ ...producto, [name]: value });
    }
  };

  // Funciones para abrir y cerrar el modal para agregar/editar productos
  const openModal = (prod = null) => {
    if (prod) {
      setProducto({
        name: prod.name || "",
        description: prod.description || "",
        price: prod.price || "",
        stock: prod.stock || "",
        categoryId: prod.categoryId?._id || prod.categoryId || "",
        supplierId: prod.supplierId?._id || prod.supplierId || "",
        image: null,
      });
      setEditingId(prod._id);
    } else {
      setProducto({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        supplierId: "",
        image: null,
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Funciones para guardar y eliminar productos
  const saveProducto = async () => {
    try {
      const formData = new FormData();
      formData.append("name", producto.name);
      formData.append("description", producto.description);
      formData.append("price", producto.price);
      formData.append("stock", producto.stock);
      formData.append("categoryId", producto.categoryId);
      formData.append("supplierId", producto.supplierId);

      // Si hay una imagen, agregarla al FormData
      if (producto.image) {
        formData.append("image", producto.image);
      }

      // Determinar la URL y el método según si estamos editando o creando un producto
      const url = editingId
        ? `/api/products/${editingId}`
        : `/api/products`;
      const method = editingId ? "PUT" : "POST";

      // Enviar la solicitud al servidor
      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      // Verificar si la respuesta es exitosa
      if (response.ok) {
        toast.success(editingId ? "Producto actualizado con éxito." : "Producto creado con éxito.");
        fetchProductos();
        closeModal();
      } else {
        toast.error(data.message || "Error guardando el producto");
      }
      // Limpiar el estado del producto
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error("Error guardando el producto");
    }
  };
  // Función para eliminar un producto
  const deleteProducto = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });
        await fetchProductos();
        toast.success("Producto eliminado con éxito.");
      } catch (error) {
        toast.error("Error al eliminar el producto: " + error.message);
      }
    }
  };

  // Función para alternar la expansión de las tarjetas de productos
  const toggleCard = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Funciones para obtener el nombre de la categoría y proveedor
  const getNombreCategoria = (id) => {
    const cat = categorias.find((c) => c._id === id);
    return cat ? cat.name : id;
  };

  // Función para obtener el nombre del proveedor
  const getNombreProveedor = (id) => {
    const prov = proveedores.find((p) => p._id === id);
    return prov ? prov.name : id;
  };

  // Renderizar el componente
  return (
    <div className="productos-container">
      <ToastContainer />
      <h1>Lista de Productos</h1>

      <div className="productos-grid">
        {Array.isArray(productos) && productos.length > 0 ? (
          productos.map((prod) => (
            <div
              key={prod._id}
              className={`producto-card ${expandedId === prod._id ? "expanded" : ""}`}
              onClick={() => toggleCard(prod._id)}
            >
              <img src={prod.image} alt={prod.name} className="producto-img" />
              <h3>{prod.name}</h3>
              <p>${prod.price}</p>

              <div className="detalles" onClick={(e) => e.stopPropagation()}>
                <p>{prod.description}</p>
                <p>Stock: {prod.stock}</p>
                <p>Categoría: {getNombreCategoria(prod.categoryId?._id || prod.categoryId)}</p>
                <p>Proveedor: {getNombreProveedor(prod.supplierId?._id || prod.supplierId)}</p>
                <button onClick={() => openModal(prod)}>Editar</button>
                <button onClick={() => deleteProducto(prod._id)}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </div>

      <button className="btn-agregar" onClick={() => openModal()}>
        Agregar Producto
      </button>

      {/* Modal para agregar/editar productos */}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingId ? "Editar" : "Agregar"} Producto</h2>
            <input
              name="name"
              placeholder="Nombre"
              value={producto.name}
              onChange={handleChange}
            />
            <input
              name="description"
              placeholder="Descripción"
              value={producto.description}
              onChange={handleChange}
            />
            <input
              name="price"
              placeholder="Precio"
              type="number"
              value={producto.price}
              onChange={handleChange}
            />
            <input
              name="stock"
              placeholder="Stock"
              type="number"
              value={producto.stock}
              onChange={handleChange}
            />
            <select name="categoryId" value={producto.categoryId} onChange={handleChange}>
              <option value="">Seleccione categoría</option>
              {categorias.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select name="supplierId" value={producto.supplierId} onChange={handleChange}>
              <option value="">Seleccione proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov._id} value={prov._id}>
                  {prov.name}
                </option>
              ))}
            </select>
            <input type="file" name="image" onChange={handleChange} />
            <div className="modal-buttons">
              <button onClick={saveProducto}>Guardar</button>
              <button onClick={closeModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProducts;
