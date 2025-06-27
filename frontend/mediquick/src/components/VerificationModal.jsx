import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../style/VerificationModal.css';

const VerificationModal = ({ 
  isOpen, 
  onClose, 
  email, 
  onVerificationSuccess 
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer para expiración del código
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          toast.error('El código ha expirado. Solicita uno nuevo.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Timer para cooldown de reenvío
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Formato del tiempo restante
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Manejar cambio en los inputs del código
  const handleCodeChange = (index, value) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Manejar teclas especiales
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
    
    if (e.key === 'Enter') {
      handleVerifyCode();
    }
  };

  // Pegar código desde el portapapeles
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const cleanedData = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (cleanedData.length === 6) {
      const newCode = cleanedData.split('');
      setCode(newCode);
      
      // Focus en el último input
      const lastInput = document.getElementById('code-5');
      lastInput?.focus();
    }
  };

  // Verificar código
  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      toast.error('Por favor ingresa el código completo');
      return;
    }

    if (timeLeft <= 0) {
      toast.error('El código ha expirado. Solicita uno nuevo.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: fullCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('¡Cuenta verificada exitosamente!');
        onVerificationSuccess(data.user);
      } else {
        if (data.expired) {
          toast.error('Código expirado. Solicita uno nuevo.');
          setTimeLeft(0);
        } else if (data.tooManyAttempts) {
          toast.error('Demasiados intentos fallidos. Solicita un nuevo código.');
          onClose();
        } else {
          toast.error(data.message || 'Código incorrecto');
          // Limpiar código y enfocar primer input
          setCode(['', '', '', '', '', '']);
          document.getElementById('code-0')?.focus();
        }
      }
    } catch (error) {
      console.error('Error verificando código:', error);
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (!canResend || resendCooldown > 0) return;

    setIsLoading(true);
    setCanResend(false);
    setResendCooldown(60); // 1 minuto de cooldown

    try {
      const response = await fetch('/api/verification/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Nuevo código enviado a tu email');
        setTimeLeft(600); // Resetear timer a 10 minutos
        setCode(['', '', '', '', '', '']); // Limpiar código anterior
        document.getElementById('code-0')?.focus();
      } else {
        toast.error(data.message || 'Error reenviando código');
        setCanResend(true);
        setResendCooldown(0);
      }
    } catch (error) {
      console.error('Error reenviando código:', error);
      toast.error('Error de conexión');
      setCanResend(true);
      setResendCooldown(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setTimeLeft(600);
      setCanResend(true);
      setResendCooldown(0);
      // Auto-focus en el primer input
      setTimeout(() => {
        document.getElementById('code-0')?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="verification-modal-overlay" onClick={onClose}>
      <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="icon">📧</div>
          <h2>Verificar tu Email</h2>
          <p>
            Hemos enviado un código de verificación a<br />
            <strong>{email}</strong>
          </p>
        </div>

        <div className="modal-content">
          <div className="code-input-container">
            <label>Ingresa el código de 6 dígitos:</label>
            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading || timeLeft <= 0}
                  className={timeLeft <= 0 ? 'expired' : ''}
                />
              ))}
            </div>
          </div>

          <div className="timer-section">
            {timeLeft > 0 ? (
              <p className="timer">
                ⏰ El código expira en: <span className="time">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="expired-text">
                ❌ El código ha expirado
              </p>
            )}
          </div>

          <div className="modal-actions">
            <button
              className="verify-btn"
              onClick={handleVerifyCode}
              disabled={isLoading || timeLeft <= 0 || code.some(digit => !digit)}
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <div className="resend-section">
              <p>¿No recibiste el código?</p>
              <button
                className="resend-btn"
                onClick={handleResendCode}
                disabled={!canResend || resendCooldown > 0 || isLoading}
              >
                {resendCooldown > 0 
                  ? `Reenviar en ${resendCooldown}s` 
                  : 'Reenviar código'
                }
              </button>
            </div>
          </div>

          <div className="help-text">
            <p>
              💡 <strong>Consejos:</strong>
            </p>
            <ul>
              <li>Revisa tu carpeta de spam si no ves el email</li>
              <li>El código tiene 6 dígitos numéricos</li>
              <li>Puedes pegar el código directamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;