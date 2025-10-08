import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-green-600">
                  check
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">¡Inicio de sesión exitoso!</h1>
            <p className="text-gray-700 mb-4">Bienvenido de nuevo. Serás redirigido al panel principal en unos segundos</p>
            <div className="mb-4">
              <p className="text-gray-600">Redirigiendo...</p>
              <p className="text-blue-600 font-semibold">{countdown} segundos restantes</p>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{width: `${((3 - countdown ) /3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla normal de login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            {/* Aqui va el icono */}
            <span className="material-symbols-outlined text-4xl text-blue-600">
              apps
            </span>
          </div>
          <h1 className="text-2xl font-bold">RRHH-PLUS</h1>
          <p className="text-gray-500 text-sm">Bienvenido de nuevo, por favor inicia sesión.</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            {message && (
                <div className={`p-3 rounded-md text-sm mb-3 +
                ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
              </div>
              )}
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
            type="text"
            placeholder="Ingresa tu correo electrónico"
            className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none 
              ${messageType === 'error' && email === '' ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
            type="password"
            placeholder="Ingresa tu contraseña"
            className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none 
              ${messageType === 'error' && password === '' ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
);
}
