import React, { useEffect, useState } from "react";

export default function AttendanceRegistration() {
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

      setDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
      setTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Registro de Asistencia
        </h2>
        <p className="text-slate-500">
          Registra tu entrada y salida de forma rápida y sencilla.
        </p>
      </div>

      {/* Bloque principal */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 mb-8">
        <div className="mb-10">
          <p className="text-xl text-slate-600">{date}</p>
          <p className="text-7xl md:text-8xl font-bold text-slate-900 tracking-tight">
            {time}
          </p>
        </div>

        {/* Botones de entrada/salida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button className="flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100 transition-all duration-300 transform hover:scale-105 shadow-sm">
            <span className="material-symbols-outlined text-5xl">login</span>
            <span className="text-xl font-semibold">Marcar Entrada</span>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100 transition-all duration-300 transform hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled
          >
            <span className="material-symbols-outlined text-5xl">logout</span>
            <span className="text-xl font-semibold">Marcar Salida</span>
          </button>
        </div>
      </div>

      {/* Registro del día */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Registro del Día
        </h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-slate-600">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 text-2xl">
              check_circle
            </span>
            <div>
              <p className="text-sm">Última Entrada</p>
              <p className="font-semibold text-lg text-slate-800">09:02 AM</p>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3 opacity-60">
            <span className="material-symbols-outlined text-slate-400 text-2xl">
              highlight_off
            </span>
            <div>
              <p className="text-sm">Salida</p>
              <p className="font-semibold text-lg text-slate-800">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}