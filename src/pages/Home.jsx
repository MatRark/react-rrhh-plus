import { getUserInfo } from "../services/authService";

export default function Home() {
  const user = getUserInfo();
  return (
    <>
      <header className="top-bar">
        <div className="breadcrumb text-sm text-text-dark">
          <h2 className="text-3xl font-bold">Panel de Control</h2>
        </div>
      </header>

      <section className="mt-6">
        <div className="card">
      <h2 className="text-4xl font-bold mb-4">
        Bienvenido de nuevo, {user.email || "Usuario"} 🤵
      </h2>          <p className="text-xl text-text-dark">
            Aquí tienes un resumen rápido de lo que está sucediendo hoy.
          </p>
        </div>
        <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <div className="card skeleton" style={{ height: '120px' }} aria-busy="true" />
          <div className="card skeleton" style={{ height: '120px' }} aria-busy="true" />
          <div className="card skeleton" style={{ height: '120px' }} aria-busy="true" />
        </div>
      </section>
    </>
  );
}
