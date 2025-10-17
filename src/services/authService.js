const API_URL = "http://rhplus.somee.com/auth/login";

export async function loginUser(credentials) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (response.status === 401) {
    throw new Error("Credenciales incorrectas o usuario inactivo.");
  }

  if (!response.ok) {
    throw new Error("Error al conectar con el servidor.");
  }

  const data = await response.json();

  // Guardar datos esenciales en localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("email", data.email);
  localStorage.setItem("roles", JSON.stringify(data.roles));
  localStorage.setItem("expiresAt", data.expiresAt);

  return data;
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
