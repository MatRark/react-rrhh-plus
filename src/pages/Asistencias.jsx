import React, { useEffect, useState } from "react";

function App() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      const formattedDate = now.toLocaleDateString("es-ES", options);
      const formattedTime = now
        .toLocaleTimeString("es-ES", { hour12: false })
        .padStart(8, "0");

      setDate(
        formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
      );
      setTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Registro de Asistencia
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-12">
              Registra tu entrada y salida de forma rápida y sencilla.
            </p>

            {/* Bloque principal */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-8 md:p-12 mb-8">
              <div className="mb-10">
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  {date}
                </p>
                <p className="text-7xl md:text-8xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {time}
                </p>
              </div>

              {/* Botones de entrada/salida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button className="flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-300 transform hover:scale-105 shadow-sm">
                  <span className="material-symbols-outlined text-5xl">
                    login
                  </span>
                  <span className="text-xl font-semibold">Marcar Entrada</span>
                </button>

                <button
                  className="flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg bg-red-50 dark:bg-red-900/50 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 transition-all duration-300 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled
                >
                  <span className="material-symbols-outlined text-5xl">
                    logout
                  </span>
                  <span className="text-xl font-semibold">Marcar Salida</span>
                </button>
              </div>
            </div>

            {/* Registro del día */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Registro del Día
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-500 filled text-2xl">
                    check_circle
                  </span>
                  <div>
                    <p className="text-sm">Última Entrada</p>
                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                      09:02 AM
                    </p>
                  </div>
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                <div className="flex items-center gap-3 opacity-60">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">
                    highlight_off
                  </span>
                  <div>
                    <p className="text-sm">Salida</p>
                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                      —
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
  