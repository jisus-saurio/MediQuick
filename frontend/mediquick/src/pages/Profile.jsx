import React, { useState, useEffect } from 'react';
import '../style/Profile.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Profile() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ ...userInfo });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    loadUserData();
    loadOrderHistory();
  }, []);

  const checkLoginStatus = () => {
    const userSession = localStorage.getItem('userSession');
    setIsLoggedIn(!!userSession);
  };

  const loadUserData = () => {
    try {
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        // Usuario logueado - cargar datos reales
        const savedUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const defaultUser = {
          name: 'Usuario Demo',
          email: 'usuario@mediquick.com',
          phone: '+503 7000-0000',
          address: 'San Salvador, El Salvador',
          password: '********'
        };
        
        const userData = Object.keys(savedUser).length > 0 ? savedUser : defaultUser;
        setUserInfo(userData);
        setEditForm(userData);
      } else {
        // Usuario no logueado - mostrar datos por defecto
        const guestUser = {
          name: 'Invitado',
          email: 'Por favor inicia sesión',
          phone: 'Por favor inicia sesión',
          address: 'Por favor inicia sesión',
          password: '********'
        };
        setUserInfo(guestUser);
        setEditForm(guestUser);
      }
    } catch (error) {
      console.error('Error cargando datos de usuario:', error);
      toast.error('Error al cargar información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderHistory = () => {
    try {
      if (isLoggedIn) {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        setOrders(orderHistory);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setOrders([]);
    }
  };

  const saveUserData = () => {
    if (!isLoggedIn) {
      toast.error('Por favor inicia sesión para editar tu perfil');
      return;
    }

    try {
      // Validaciones básicas
      if (!editForm.name.trim()) {
        toast.error('El nombre es obligatorio');
        return;
      }
      
      if (!editForm.email.trim() || !editForm.email.includes('@')) {
        toast.error('Email válido es obligatorio');
        return;
      }
      
      if (!editForm.phone.trim()) {
        toast.error('El teléfono es obligatorio');
        return;
      }
      
      if (!editForm.address.trim()) {
        toast.error('La dirección es obligatoria');
        return;
      }

      // Guardar en localStorage
      localStorage.setItem('userProfile', JSON.stringify(editForm));
      setUserInfo(editForm);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error guardando datos:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleEditClick = () => {
    if (!isLoggedIn) {
      toast.error('Por favor inicia sesión para editar tu perfil');
      return;
    }
    setIsEditing(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cancelEdit = () => {
    setEditForm({ ...userInfo });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#007bff';
      case 'shipped':
        return '#17a2b8';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'delivered':
        return 'Entregada';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'shipped':
        return 'Enviada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const goToOrderHistory = () => {
    window.location.href = '/OrderHistory';
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  const handleLogout = () => {
    if (!isLoggedIn) {
      toast.error('No hay una sesión activa');
      return;
    }

    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Limpiar datos de sesión
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      
      // Disparar evento de cambio de estado para actualizar la navegación
      window.dispatchEvent(new CustomEvent('loginStateChanged'));
      
      // Actualizar estado local
      setIsLoggedIn(false);
      loadUserData(); // Recargar datos de invitado
      
      // Mostrar mensaje de confirmación
      toast.success('Sesión cerrada correctamente');
      
      // Redirigir al home después de un breve delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <ToastContainer />
      
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="profile-welcome">
          <h1>¡Hola, {userInfo.name}!</h1>
          <p>Gestiona tu información personal y revisa tu historial de compras</p>
        </div>
        <div className="profile-actions">
          {isLoggedIn ? (
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              🚪 Cerrar Sesión
            </button>
          ) : (
            <button 
              className="login-btn"
              onClick={goToLogin}
              title="Iniciar sesión"
            >
              🔑 Iniciar Sesión
            </button>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={activeTab === 'profile' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('profile')}
        >
          <span className="tab-icon">👤</span>
          Mi Información
        </button>
        <button 
          className={activeTab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('orders')}
        >
          <span className="tab-icon">📦</span>
          Mis Compras
        </button>
        <button 
          className={activeTab === 'stats' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('stats')}
        >
          <span className="tab-icon">📊</span>
          Estadísticas
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-info-section">
            <div className="section-header">
              <h2>Información Personal</h2>
              {!isEditing ? (
                <button 
                  className="edit-btn"
                  onClick={handleEditClick}
                >
                  ✏️ Editar
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={saveUserData}
                  >
                    💾 Guardar
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={cancelEdit}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="profile-fields">
              <div className="field-group">
                <label>Nombre Completo</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    placeholder="Tu nombre completo"
                  />
                ) : (
                  <div className="field-value">{userInfo.name}</div>
                )}
              </div>

              <div className="field-group">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    placeholder="tu@email.com"
                  />
                ) : (
                  <div className="field-value">{userInfo.email}</div>
                )}
              </div>

              <div className="field-group">
                <label>Teléfono</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    placeholder="+503 0000-0000"
                  />
                ) : (
                  <div className="field-value">{userInfo.phone}</div>
                )}
              </div>

              <div className="field-group">
                <label>Dirección</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditFormChange}
                    placeholder="Tu dirección completa"
                    rows="3"
                  />
                ) : (
                  <div className="field-value">{userInfo.address}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h2>Historial de Compras</h2>
              <button 
                className="view-all-btn"
                onClick={goToOrderHistory}
              >
                Ver Todo
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-icon">📦</div>
                {isLoggedIn ? (
                  <>
                    <h3>No hay compras aún</h3>
                    <p>Cuando realices tu primera compra, aparecerá aquí</p>
                    <button 
                      className="start-shopping-btn"
                      onClick={() => window.location.href = '/products'}
                    >
                      Comenzar a Comprar
                    </button>
                  </>
                ) : (
                  <>
                    <h3>Inicia sesión para ver tus compras</h3>
                    <p>Necesitas iniciar sesión para acceder a tu historial de compras</p>
                    <button 
                      className="start-shopping-btn"
                      onClick={goToLogin}
                    >
                      Iniciar Sesión
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="recent-orders">
                {orders.slice(0, 3).map((order) => (
                  <div key={order._id} className="order-summary">
                    <div className="order-summary-header">
                      <span className="order-number">
                        #{order.orderNumber || order._id?.slice(-6)}
                      </span>
                      <span 
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="order-summary-info">
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                      <p className="order-total">${order.total?.toFixed(2)}</p>
                      <p className="order-items">
                        {order.products?.length} producto{order.products?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-section">
            <h2>Estadísticas de Compras</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🛒</div>
                <div className="stat-info">
                  <h3>{orders.length}</h3>
                  <p>Órdenes Totales</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>${orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}</h3>
                  <p>Total Gastado</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{orders.filter(o => ['completed', 'delivered'].includes(o.status)).length}</h3>
                  <p>Órdenes Completadas</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{orders.filter(o => o.status === 'pending').length}</h3>
                  <p>Órdenes Pendientes</p>
                </div>
              </div>
            </div>

            {orders.length > 0 && (
              <div className="stats-details">
                <h3>Detalles Adicionales</h3>
                <div className="detail-stats">
                  <p>
                    <strong>Promedio por orden:</strong> 
                    ${orders.length > 0 ? (orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length).toFixed(2) : '0.00'}
                  </p>
                  <p>
                    <strong>Productos comprados:</strong> 
                    {orders.reduce((sum, order) => sum + (order.products?.length || 0), 0)} artículos
                  </p>
                  <p>
                    <strong>Fecha primera compra:</strong> 
                    {orders.length > 0 ? formatDate(orders[orders.length - 1].createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;