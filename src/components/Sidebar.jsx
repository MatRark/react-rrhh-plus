import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getUserInfo, logoutUser } from "../services/authService"; // el servicio de auth

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Obtener info del usuario
  const user = getUserInfo();
  const roles = user.roles || [];

  // Mapa de visibilidad de módulos según roles
  const modules = [
    { to: "/home", icon: "dashboard", label: "Panel de Control", roles: ["*"] },
    { to: "/empleados", icon: "groups", label: "Empleados", roles: ["admin", "gestor_empleados", "empleado"] },
    { to: "/reclutamiento", icon: "work", label: "Reclutamiento", roles: ["admin", "reclutador"] },
    { to: "/evaluaciones", icon: "grade", label: "Evaluaciones", roles: ["admin", "evaluador", "reclutador", "empleado"] },
    { to: "/asistencias", icon: "event_available", label: "Asistencias", roles: ["admin", "gestor_empleados", "operador_asistencia", "empleado"] },
    { to: "/contratos", icon: "request_quote", label: "Contratos", roles: ["admin", "gestor_empleados", "empleado"] },
  ];

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onEsc = (e) => open && e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logoutUser();
    window.location.href = "/login";
  };

  // Función para validar si el usuario puede ver un módulo
  const canView = (allowedRoles) => {
    if (allowedRoles.includes("*")) return true;
    return roles.some(r => allowedRoles.includes(r));
  };

  return (
    <aside className="sidebar flex flex-col shrink-0">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border-light dark:border-border-dark">
        <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">apps</span>
        <h1 className="text-xl font-bold">RRHH-PLUS</h1>
      </div>

      <nav className="flex-1 px-2 py-4 flex flex-col" aria-label="Principal">
        {modules.map(({ to, icon, label, roles }) => (
          canView(roles) && (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item w-full ${isActive ? "active" : ""}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          )
        ))}
      </nav>

      <div className="px-4 pb-5 mt-auto relative">
        {open && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="Menú de usuario"
            className="absolute left-0 right-0 -top-2 -translate-y-full bg-white border border-gray-200 shadow-xl rounded-xl p-2"
          >
            <NavLink
              to="/perfil"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
            >
              <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
              <span>Perfil</span>
            </NavLink>

            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logoutUser();          // Limpiamos el localStorage
                window.location.href = "/login"; // Procedemos a redirigir al login
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              <span>Cerrar sesión</span>
            </button>

          </div>
        )}

        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(v => !v)}
          className="
    w-full flex items-center gap-3 px-3 py-2
    rounded-xl border border-gray-200 bg-white
    shadow-sm hover:shadow transition
    text-left
    focus:outline-none focus:ring-2 focus:ring-blue-500
  "
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border"
            style={{
              borderColor: 'var(--primary-500)',
              backgroundImage:
                'url("https://cdn-icons-png.flaticon.com/512/9131/9131529.png")',
            }}
            aria-hidden="true"
          />

          <div className="min-w-0">
            {/* Aquí mostramos el nombre o el rol principal */}
            <p className="text-sm font-medium text-gray-900 leading-tight truncate">
              {roles[0] || "Usuario"}
            </p>

            {/* Aquí el correo */}
            <p className="text-xs text-gray-500 leading-tight truncate">
              {user.email || "usuario@generico.com"}
            </p>
          </div>

          <span
            className={`ml-auto material-symbols-outlined text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            expand_more
          </span>
        </button>

      </div>
    </aside>
  );
}
