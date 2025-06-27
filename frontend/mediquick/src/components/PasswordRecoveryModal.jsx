import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../style/PasswordRecoveryModal.css"; // Asegúrate de crear este archivo CSS

const PasswordRecoveryModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: email, 2: codigo, 3: nueva contraseña
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Reset modal state cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail("");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");
      setCountdown(0);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Paso 1: Enviar código al email
  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("El email es requerido");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Formato de email inválido");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/password-recovery/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("📧 Código enviado a tu email");
        setStep(2);
        setCountdown(600); // 10 minutos
      } else {
        toast.error(data.message || "Error al enviar código");
      }
    } catch (error) {
      toast.error("Error de conexión");
      console.error("Error enviando código:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Verificar código
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!code) {
      toast.error("El código es requerido");
      return;
    }

    if (code.length !== 6) {
      toast.error("El código debe tener 6 dígitos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/password-recovery/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("✅ Código verificado correctamente");
        setResetToken(data.resetToken);
        setStep(3);
        setCountdown(900); // 15 minutos para cambiar contraseña
      } else {
        toast.error(data.message || "Código inválido");
      }
    } catch (error) {
      toast.error("Error de conexión");
      console.error("Error verificando código:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 3: Restablecer contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Ambas contraseñas son requeridas");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/password-recovery/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("🎉 Contraseña actualizada exitosamente");
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Error al actualizar contraseña");
      }
    } catch (error) {
      toast.error("Error de conexión");
      console.error("Error restableciendo contraseña:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleResendCode = () => {
    setStep(1);
    setCode("");
    setCountdown(0);
  };

  if (!isOpen) return null;

  return (
    <div className="password-recovery-overlay">
      <div className="password-recovery-modal">
        <div className="modal-header">
          <h2>🔐 Recuperar Contraseña</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Indicador de pasos */}
          <div className="steps-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>

          {/* Paso 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode}>
              <h3>Ingresa tu email</h3>
              <p>Te enviaremos un código de verificación para restablecer tu contraseña.</p>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Código"}
              </button>
            </form>
          )}

          {/* Paso 2: Código */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <h3>Verificar Código</h3>
              <p>Ingresa el código de 6 dígitos que enviamos a <strong>{email}</strong></p>
              
              {countdown > 0 && (
                <div className="countdown">
                  ⏱️ Código válido por: <strong>{formatTime(countdown)}</strong>
                </div>
              )}
              
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                maxLength="6"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                required
              />
              
              <button type="submit" disabled={isLoading || code.length !== 6}>
                {isLoading ? "Verificando..." : "Verificar Código"}
              </button>
              
              <div className="resend-section">
                <button type="button" onClick={handleResendCode} className="resend-btn">
                  ¿No recibiste el código? Reenviar
                </button>
              </div>
            </form>
          )}

          {/* Paso 3: Nueva contraseña */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <h3>Nueva Contraseña</h3>
              <p>Ingresa tu nueva contraseña para la cuenta <strong>{email}</strong></p>
              
              {countdown > 0 && (
                <div className="countdown">
                  ⏱️ Tiempo restante: <strong>{formatTime(countdown)}</strong>
                </div>
              )}
              
              <input
                type="password"
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                minLength="6"
                required
              />
              
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                minLength="6"
                required
              />
              
              <button type="submit" disabled={isLoading || newPassword !== confirmPassword}>
                {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryModal;