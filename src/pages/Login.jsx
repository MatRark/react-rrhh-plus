import { useState } from "react";
import "../styles/Login.css";
import { loginUser } from "../services/authService";
import SuccessModal from "../components/SuccessModal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      setMessage("Completa todos los campos.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await loginUser({ email, password });
      setLoginSuccess(true);
      setMessage("¡Inicio de sesión exitoso!");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Error al iniciar sesión");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (loginSuccess) {
    return <SuccessModal />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Sección Izquierda - Imagen y Branding */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-branding">
              <span className="material-symbols-outlined login-logo">apps</span>
              <div className="login-brand-text">
                <h1>RRHH-PLUS</h1>
              </div>
            </div>
            
            <div className="login-info" style={{marginBottom: '80px'}}>
              <h2 style={{ textAlign: 'center' }}>La Plataforma Definitiva para RH</h2>
              <p >
                Administra tu equipo, contratos, asistencias y más desde una sola plataforma.
                Tu aliado digital para una gestión eficiente.
              </p>
            </div>
          </div>
        </div>

        {/* Sección Derecha - Formulario */}
        <div className="login-right">
          <div className="login-header">
            <h1 className="login-title" style={{ textAlign: 'center', marginBottom: '55px' }}>Iniciar Sesión</h1>
            <p className="login-subtitle" style={{ textAlign: 'center' }}>Ingresa tus credenciales para continuar</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {message && (
              <div className={`message-box ${messageType === "error" ? "message-error" : "message-success"}`}>
                {message}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className={`form-input ${messageType === "error" && email === "" ? "input-error" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    borderRadius: '8px',
                    border: '2px solid #a4c6fcff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  className={`form-input ${messageType === "error" && password === "" ? "input-error" : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
                    borderRadius: '8px',
                    border: '2px solid #a4c6fcff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}