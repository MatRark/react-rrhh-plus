import { useState } from "react";
import "../styles/Login.css";
import { loginUser } from "../services/authService";
import SuccessModal from "../components/SuccessModal"; // Importa el nuevo componente

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
      <div className="background-overlay"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "3.5rem" }}>apps</span>
          </div>
          <h1 className="login-title">RRHH-PLUS</h1>
          <p className="login-subtitle">Bienvenido de nuevo, por favor inicia sesión.</p>
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
                placeholder="Ingresa tu correo electrónico"
                className={`form-input ${messageType === "error" && email === "" ? "input-error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}