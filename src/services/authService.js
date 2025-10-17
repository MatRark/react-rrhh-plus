const API_URL = "http://rhplus.somee.com/auth/login";

export async function loginUser(credentials) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const errorData = response.status !== 200 ? await response.json().catch(() => ({})) : null;

    // Manejo personalizado de errores
    if (response.status === 400) {
      throw new Error("Las credenciales ingresadas no son válidas. Por favor, revisa los campos.");
    }

    if (response.status === 401) {
      const message = errorData?.message || "";
      if (message.includes("Correo no registrado")) {
        throw new Error("El correo ingresado no se encuentra registrado en el sistema.");
      }
      if (message.includes("Contraseña incorrecta")) {
        throw new Error("La contraseña ingresada es incorrecta. Intenta nuevamente.");
      }
      throw new Error("No fue posible iniciar sesión. Verifica tus credenciales.");
    }

    if (response.status === 403) {
      throw new Error("Tu cuenta está inactiva. Por favor, contacta al administrador del sistema.");
    }

    if (!response.ok) {
      throw new Error("Ocurrió un error al conectar con el servidor. Inténtalo más tarde.");
    }

    const data = await response.json();

    // Guardar datos esenciales en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.email);
    localStorage.setItem("roles", JSON.stringify(data.roles));
    localStorage.setItem("expiresAt", data.expiresAt);

    return data;
  } catch (error) {
    // Si es un error genérico (por red, etc.)
    throw new Error(error.message || "Error desconocido al iniciar sesión.");
  }
}

export function logoutUser() {
  localStorage.clear();
}

export function isAuthenticated() {
  const token = localStorage.getItem("token");
  const expiresAt = localStorage.getItem("expiresAt");
  if (!token || !expiresAt) return false;

  const now = new Date();
  return new Date(expiresAt) > now;
}

export function getUserInfo() {
  return {
    email: localStorage.getItem("email"),
    roles: JSON.parse(localStorage.getItem("roles") || "[]"),
    token: localStorage.getItem("token"),
  };
}
