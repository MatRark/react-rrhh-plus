import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    
    <aside className="sidebar flex flex-col shrink-0">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border-light dark:border-border-dark">
        <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">apps</span>
        <h1 className="text-xl font-bold">RRHH-PLUS</h1>
      </div>

      <nav className="flex-1 px-2 py-4 flex flex-col" aria-label="Principal">
        <NavLink to="/home" end className={({isActive}) => `nav-item w-full ${isActive ? "active" : ""}`}>
          <span className="material-symbols-outlined" aria-hidden="true">dashboard</span>
          <span>Panel de Control</span>
        </NavLink>

        <NavLink to="/empleados" className={({isActive}) => `nav-item w-full ${isActive ? "active" : ""}`}>
          <span className="material-symbols-outlined" aria-hidden="true">groups</span>
          <span>Empleados</span>
        </NavLink>

        <NavLink to="/reclutamiento" className={({isActive}) => `nav-item w-full ${isActive ? "active" : ""}`}>
          <span className="material-symbols-outlined" aria-hidden="true">work</span>
          <span>Reclutamiento</span>
        </NavLink>

        <NavLink to="/evaluaciones" className={({isActive}) => `nav-item w-full ${isActive ? "active" : ""}`}>
          <span className="material-symbols-outlined" aria-hidden="true">grade</span>
          <span>Evaluaciones</span>
        </NavLink>

        <NavLink to="/asistencias" className={({isActive}) => `nav-item w-full ${isActive ? "active" : ""}`}>
          <span className="material-symbols-outlined" aria-hidden="true">event_available</span>
          <span>Asistencias</span>
        </NavLink>

        <NavLink to="/contratos" className={({isActive}) => `nav-item w-full ${isActive ? "active" : ""}`}>
          <span className="material-symbols-outlined" aria-hidden="true">request_quote</span>
          <span>Contratos</span>
        </NavLink>
      </nav>

      <div className="px-6 pb-6 mt-auto">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 border-2"
          style={{
            borderColor: 'var(--primary-500)',
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuADgd3RJCWxoZnZvaEv-rPel5QT5n6yjUhwNrkRWOxO8SZJdtRDYI_7Ta9GzvlB9sOukLSSms7TbpIma8-l43EnWb1LeOsZf8_epesTFdja6J1LLCC_zv0Vwy2FxYC6_1abdbwxxgh3nLZtzQabfb1dsL8Cb1maN0p_EUrozQf3AElqmxp-OTcHl9h_-G5q9lWBfFsqrwCcN28hMti05rifEhfQ1fyxp6H_yBQZKEAWBkSKeEBpoOV8vcBX1bC_1CZzxnFiaeY-Qkg")',
          }}
          role="img"
          aria-label="Foto de usuario"
        />
      </div>
    </aside>
  );
}
