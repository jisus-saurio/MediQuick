import { useState } from 'react';
import { toast } from 'react-toastify';

export const useOrderProcessing = (currentUser, isLoggedIn) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'card'
  });
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateOrderForm = () => {
    const { customerName, email, phone, address } = orderForm;
    
    if (!customerName.trim()) {
      toast.error('El nombre es obligatorio');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Email válido es obligatorio');
      return false;
    }
    
    if (!phone.trim()) {
      toast.error('El teléfono es obligatorio');
      return false;
    }
    
    if (!address.trim()) {
      toast.error('La dirección es obligatoria');
      return false;
    }
    
    return true;
  };

  const updateProductStock = async (productId, quantityToDeduct) => {
    try {
      const response = await fetch(`/api/products/${productId}/update-stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantityToDeduct: quantityToDeduct
        })
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.warn('No se pudo actualizar stock en servidor, continuando...');
        return null;
      }
    } catch (error) {
      console.warn('Error actualizando stock, continuando sin actualizar:', error);
      return null;
    }
  };

  const prefillFormWithUserData = (getUserProfile) => {
    if (isLoggedIn && currentUser) {
      const userProfile = getUserProfile();
      if (userProfile.name && userProfile.name !== 'Invitado') {
        setOrderForm(prev => ({
          ...prev,
          customerName: userProfile.name || '',
          email: userProfile.email || currentUser.email || '',
          phone: userProfile.phone || '',
          address: userProfile.address || ''
        }));
      }
    }
  };

  const resetForm = () => {
    setOrderForm({
      customerName: '',
      email: '',
      phone: '',
      address: '',
      paymentMethod: 'card'
    });
    setShowOrderForm(false);
  };

  return {
    isProcessing,
    setIsProcessing,
    orderForm,
    setOrderForm,
    showOrderForm,
    setShowOrderForm,
    handleOrderFormChange,
    validateOrderForm,
    updateProductStock,
    prefillFormWithUserData,
    resetForm
  };
};