// src/pages/Home.jsx
export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark min-h-screen">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="sidebar flex flex-col">
          {/* Encabezado logo */}
          <div className="flex items-center gap-3 px-6 h-16 border-b border-border-light dark:border-border-dark">
            <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">
              apps
            </span>
            <h1 className="text-xl font-bold">RRHH-PLUS</h1>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-2 py-4" aria-label="Principal">
            <a href="#" className="nav-item">
              <span className="material-symbols-outlined" aria-hidden="true">dashboard</span>
              <span>Panel de Control</span>
            </a>

            {/* Ejemplo de item activo según la vista */}
            <a href="#" className="nav-item active" aria-current="page">
              <span className="material-symbols-outlined" aria-hidden="true">groups</span>
              <span>Empleados</span>
            </a>

            <a href="#" className="nav-item">
              <span className="material-symbols-outlined" aria-hidden="true">work</span>
              <span>Reclutamiento</span>
            </a>

            <a href="#" className="nav-item">
              <span className="material-symbols-outlined" aria-hidden="true">grade</span>
              <span>Evaluaciones</span>
            </a>

            <a href="#" className="nav-item">
              <span className="material-symbols-outlined" aria-hidden="true">event_available</span>
              <span>Asistencias</span>
            </a>

            <a href="#" className="nav-item">
              <span className="material-symbols-outlined" aria-hidden="true">request_quote</span>
              <span>Contratos</span>
            </a>
          </nav>

          {/* Usuario */}
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

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="top-bar">
            <div className="breadcrumb text-sm text-text-dark">
              <span className="sr-only">Estas en:</span> Panel de Control
            </div>

            <div className="flex items-center gap-3">
              <button className="btn btn-primary btn-sm" type="button">
                <span className="material-symbols-outlined" aria-hidden="true">add</span>
                Añadir empleado
              </button>
            </div>
          </header>

          {/* Cuerpo */}
          <section className="flex-1 p-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-2">Bienvenido de nuevo, Administrador</h2>
              <p className="text-text-dark">Aquí tienes un resumen rápido de lo que está sucediendo hoy.</p>
            </div>

            {/* Ejemplo de grid responsive del PDF */}
            <div className="grid gap-4 mt-6"
                 style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <div className="card skeleton" style={{ height: '120px' }} aria-busy="true" />
              <div className="card skeleton" style={{ height: '120px' }} aria-busy="true" />
              <div className="card skeleton" style={{ height: '120px' }} aria-busy="true" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
