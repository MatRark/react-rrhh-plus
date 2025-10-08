import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const navigate = useNavigate();

  const kesy = {
    email: 'empleado@gmail.com',
    password: 'asdf1234'
  }

  useEffect(() => {
    if (loginSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (loginSuccess && countdown === 0) {
      navigate('/home');
    }
  }, [loginSuccess, countdown, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (email === '' || password === ''){
      setMessage('No dejes ningún campo vacío');
      setMessageType('error');
      return;
    }
    
    if (email === kesy.email && password === kesy.password) {
      setLoginSuccess(true);
      setMessage('Bienvenido');
      setMessageType('success');
    } else {
      setMessage('Credenciales incorrectas');
      setMessageType('error');
    }
  }

  // Si el login fue exitoso, mostrar la pantalla de éxito
  if (loginSuccess) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-content">
            <div className="success-icon-wrapper">
              <div className="success-icon-circle">
                <span className="material-symbols-outlined success-icon">
                  check
                </span>
              </div>
            </div>
            <h1 className="success-title">¡Inicio de sesión exitoso!</h1>
            <p className="success-description">
              Bienvenido de nuevo. Serás redirigido al panel principal en unos segundos
            </p>
            <div className="redirect-info">
              <p className="redirect-label">Redirigiendo...</p>
              <p className="redirect-countdown">{countdown} segundos restantes</p>
            </div>

            {/* Barra de progreso */}
            <div className="progress-bar-container">
              <div 
                className="progress-bar"
                style={{width: `${((3 - countdown) / 3) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla normal de login
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <span className="material-symbols-outlined">
              apps
            </span>
          </div>
          <h1 className="login-title">RRHH-PLUS</h1>
          <p className="login-subtitle">
            Bienvenido de nuevo, por favor inicia sesión.
          </p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`message-box ${messageType === 'error' ? 'message-error' : 'message-success'}`}>
              {message}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="text"
              placeholder="Ingresa tu correo electrónico"
              className={`form-input ${messageType === 'error' && email === '' ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              className={`form-input ${messageType === 'error' && password === '' ? 'input-error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}