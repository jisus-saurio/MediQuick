import React, { useState, useEffect } from "react";
import "../style/AddProductos.css";

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

 const fetchProductos = async () => {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();

    // Si el backend devuelve { products: [...] }
    const productList = Array.isArray(data) ? data : data.products || [];

    setProductos(productList);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    setProductos([]); // Para evitar que productos quede como null o undefined
  }
};


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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setProducto({ ...producto, image: files[0] });
    } else {
      setProducto({ ...producto, [name]: value });
    }
  };

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

  const saveProducto = async () => {
    const formData = new FormData();
    for (let key in producto) {
      if (producto[key] !== null) {
        formData.append(key, producto[key]);
      }
    }

    const url = editingId
      ? `/api/products/${editingId}`
      : "/api/products";
    const method = editingId ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        body: formData,
      });
      await fetchProductos();
      closeModal();
      alert(editingId ? "Producto actualizado con éxito." : "Producto agregado con éxito.");
    } catch (error) {
      alert("Error al guardar el producto: " + error.message);
    }
  };

  const deleteProducto = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });
        await fetchProductos();
        alert("Producto eliminado con éxito.");
      } catch (error) {
        alert("Error al eliminar el producto: " + error.message);
      }
    }
  };

  const toggleCard = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getNombreCategoria = (id) => {
    const cat = categorias.find((c) => c._id === id);
    return cat ? cat.name : id;
  };

  const getNombreProveedor = (id) => {
    const prov = proveedores.find((p) => p._id === id);
    return prov ? prov.name : id;
  };

  return (
    <div className="productos-container">
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
