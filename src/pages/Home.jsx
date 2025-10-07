// src/pages/Home.jsx
export default function Home() {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <div className="flex h-screen">
        {/* Aside */}
        <aside className="w-64 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark flex flex-col">
          <div className="flex items-center gap-3 px-6 h-16 border-b border-border-light dark:border-border-dark">
            <div className="text-primary">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold">RHPlus</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <a
              className="flex items-center gap-3 px-4 py-2 rounded-DEFAULT hover:bg-primary/10 hover:text-primary transition-colors duration-200 text-text-light dark:text-text-dark"
              href="#"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Panel de Control
            </a>

            <a
              className="flex items-center gap-3 px-4 py-2 rounded-DEFAULT bg-primary/10 text-primary font-semibold"
              href="#"
            >
              <span className="material-symbols-outlined">groups</span>
              Empleados
            </a>
            <a className="flex items-center gap-3 px-4 py-2 rounded-DEFAULT hover:bg-primary/10 hover:text-primary transition-colors duration-200 text-text-light dark:text-text-dark" href="#">
              <span className="material-symbols-outlined">work</span>
              Reclutamiento
            </a>

            <a className="flex items-center gap-3 px-4 py-2 rounded-DEFAULT hover:bg-primary/10 hover:text-primary transition-colors duration-200 text-text-light dark:text-text-dark" href="#">
              <span className="material-symbols-outlined">grade</span>
              Evaluaciones
            </a>

            <a className="flex items-center gap-3 px-4 py-2 rounded-DEFAULT hover:bg-primary/10 hover:text-primary transition-colors duration-200 text-text-light dark:text-text-dark" href="#">
              <span className="material-symbols-outlined">event_available</span>
              Asistencias
            </a>

            <a className="flex items-center gap-3 px-4 py-2 rounded-DEFAULT hover:bg-primary/10 hover:text-primary transition-colors duration-200 text-text-light dark:text-text-dark" href="#">
              <span className="material-symbols-outlined">request_quote</span>
              Contratos
            </a>
          </nav>

          <div className="px-6 pb-6">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 border-2 border-primary"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuADgd3RJCWxoZnZvaEv-rPel5QT5n6yjUhwNrkRWOxO8SZJdtRDYI_7Ta9GzvlB9sOukLSSms7TbpIma8-l43EnWb1LeOsZf8_epesTFdja6J1LLCC_zv0Vwy2FxYC6_1abdbwxxgh3nLZtzQabfb1dsL8Cb1maN0p_EUrozQf3AElqmxp-OTcHl9h_-G5q9lWBfFsqrwCcN28hMti05rifEhfQ1fyxp6H_yBQZKEAWBkSKeEBpoOV8vcBX1bC_1CZzxnFiaeY-Qkg")',
              }}
            />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between h-16 px-8 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark sticky top-0 z-10 flex-shrink-0">
            <h2 className="text-2xl font-bold">Panel de Control</h2>
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center h-10 px-4 rounded-DEFAULT bg-primary text-white text-sm font-semibold gap-2">
                <span className="material-symbols-outlined">add</span>
                <span>Añadir Empleado</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-foreground-light dark:text-foreground-dark">
                Bienvenido de nuevo, Administrador
              </h3>
              <p className="mt-2 text-lg text-text-light dark:text-text-dark">
                Aquí tienes un resumen rápido de lo que está sucediendo hoy.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
