import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessModal() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-overlay">
      {/* Ondas animadas de fondo */}
      <div className="wave-container">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>

      {/* Contenedor del éxito */}
      <div className="success-wrapper">
        {/* Círculo expandible con efecto ripple */}
        <div className="ripple-container">
          <div className="ripple ripple-1"></div>
          <div className="ripple ripple-2"></div>
          <div className="ripple ripple-3"></div>
        </div>

        {/* Icono check animado */}
        <div className="check-container">
          <svg className="check-svg" viewBox="0 0 52 52">
            <circle className="check-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        {/* Texto con efecto de aparición */}
        <div className="success-text-wrapper">
          <h2 className="success-heading">¡Acceso Concedido!</h2>
          <p className="success-subtext">Preparando tu espacio de trabajo...</p>
        </div>

        {/* Barra de progreso */}
        <div className="progress-container">
          <div className="progress-bar-success"></div>
        </div>
      </div>
    </div>
  );
}