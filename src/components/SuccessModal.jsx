// components/SuccessModal.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessModal() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 2000); // 1.3 segundos

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-modal-container">
      {/* Misma estructura de fondo que el login */}
      <div className="success-modal-background">
        <div className="background-overlay"></div>
      </div>
      
      <div className="success-modal">
        <div className="success-animation">
          <div className="success-circle">
            <div className="success-checkmark">✓</div>
          </div>
          <div className="success-confetti">
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
          </div>
        </div>
        
        <div className="success-content">
          <h1 className="success-title">¡Bienvenido de nuevo!</h1>
          <p className="success-message">
            Inicio de sesión exitoso. Redirigiendo al panel principal...
          </p>
        </div>
      </div>
    </div>
  );
}