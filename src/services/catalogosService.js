// ARHVIO PARA AREAS Y PUESTOS (DROPDOWN LIST)
const BASE = "https://rhplus.somee.com/api/Employees";

const getToken = () => localStorage.getItem("token") || "";

export async function getAreas() {
  const res = await fetch(`${BASE}/areas`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Accept": "application/json"
    }
  });

  if (!res.ok) throw new Error("Error al cargar áreas");
  return res.json();
}

export async function getPuestos(areaId) {
  const res = await fetch(`${BASE}/puestos?areaId=${areaId}`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Accept": "application/json"
    }
  });

  if (!res.ok) throw new Error("Error al cargar puestos");
  return res.json();
}
