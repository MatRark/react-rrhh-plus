import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getUserInfo, logoutUser } from "../services/authService";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const user = getUserInfo() || {};
  const roles = user.roles || [];

  const modules = [
    { to: "/home", icon: "dashboard", label: "Panel de Control", roles: ["*"] },
    { to: "/empleados", icon: "groups", label: "Empleados", roles: ["admin", "gestor_empleados"] },
    { to: "/reclutamiento", icon: "work", label: "Reclutamiento", roles: ["admin", "reclutador"] },
    { to: "/evaluaciones", icon: "grade", label: "Evaluaciones", roles: ["admin", "evaluador", "reclutador", "empleado"] },
    { to: "/asistencias", icon: "event_available", label: "Asistencias", roles: ["admin", "gestor_empleados", "operador_asistencia", "empleado"] },
    { to: "/contratos", icon: "request_quote", label: "Contratos", roles: ["admin", "gestor_empleados", "empleado"] },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const canView = (allowedRoles) => {
    if (allowedRoles.includes("*")) return true;
    return roles.some(r => allowedRoles.includes(r));
  };

  return (
    <>
      {/* Botón menú móvil */}
      <button
        onClick={() => setShowSidebar(v => !v)}
        className="fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md shadow-lg md:hidden"
      >
        <span className="material-symbols-outlined text-2xl">menu</span>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          sidebar fixed md:static top-0 left-0 z-40
          flex flex-col shrink-0
          h-screen md:h-auto
          w-64 md:w-64
          bg-white dark:bg-gray-900 border-r border-border-light dark:border-border-dark
          transform transition-transform duration-300 ease-in-out
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border-light dark:border-border-dark">
          <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">apps</span>
          <h1 className="text-xl font-bold">RRHH-PLUS</h1>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          <nav className="px-2 py-4 flex flex-col" aria-label="Principal">
            {modules.map(({ to, icon, label, roles }) => (
              canView(roles) && (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => {
                    // 🆕 Oculta el sidebar al hacer clic en un módulo (solo en móvil)
                    if (window.innerWidth < 768) setShowSidebar(false);
                  }}
                  className={({ isActive }) => `nav-item w-full ${isActive ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </NavLink>
              )
            ))}
          </nav>
        </div>

        {/* Menú de usuario */}
        <div className="px-4 pb-5 mt-auto relative border-t border-gray-200 dark:border-gray-700">
          {open && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Menú de usuario"
              className="absolute left-0 right-0 -top-2 -translate-y-full bg-white border border-gray-200 shadow-xl rounded-xl p-2">
              {
              /* SE OCULTO ESTO POR EL BIEN DEL EQUIPO   iufivevr
              <NavLink
                to="/perfil"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  if (window.innerWidth < 768) setShowSidebar(false); // 🆕 también cierra sidebar si abre perfil en móvil
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
              >
                <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
                <span>Perfil</span>
              </NavLink>
              */}

              <button
                role="menuitem"
                onClick={handleLogout}
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
              <p className="text-sm font-medium text-gray-900 leading-tight truncate">
                {roles[0] || "Usuario"}
              </p>
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

      {/* Fondo oscuro móvil */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </>
  );
}
