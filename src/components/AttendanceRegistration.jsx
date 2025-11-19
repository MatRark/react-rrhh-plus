import React, { useEffect, useState } from "react";
import { registerAttendance, getAllAttendances } from "../services/attendanceService";

export default function AttendanceRegistration() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);

  // 🕒 Actualiza hora y fecha en vivo
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

  // 📅 Cargar registro del día actual
  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const data = await getAllAttendances();
      const today = new Date().toISOString().split("T")[0];
      const record = data.find((a) => a.fecha?.startsWith(today));
      setTodayRecord(record || null);
    } catch (err) {
      console.error(err);
      setTodayRecord(null);
    }
  };

  // 🔘 Registrar entrada o salida
  const handleRegister = async (tipoRegistro) => {
    setLoading(true);
    setInfoMessage(null);

    try {
      await registerAttendance(tipoRegistro);

      if (tipoRegistro === "entrada") {
        setInfoMessage(
          "Has registrado tu entrada correctamente. ¡Buen día de trabajo!"
        );
      } else {
        setInfoMessage(
          "Has registrado tu salida correctamente. ¡Hasta luego!"
        );
      }

      await loadTodayAttendance();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Bad Request") || msg.includes("ya existe")) {
        setInfoMessage("Ya registraste tu entrada hoy.");
      } else if (msg.includes("token") || msg.includes("Unauthorized")) {
        setInfoMessage("Tu sesión expiró. Inicia sesión nuevamente.");
      } else {
        setInfoMessage("No pudimos registrar tu asistencia. Por favor, inténtalo de nuevo en unos momentos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const hasEntrada = Boolean(todayRecord?.horaEntrada);
  const hasSalida = Boolean(todayRecord?.horaSalida);

  // 💬 Bloque informativo azul
  const renderInfoBox = () => {
    if (!infoMessage) return null;
    return (
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
        <span className="material-symbols-outlined text-[22px]">info</span>
        <p className="text-sm font-medium leading-relaxed">{infoMessage}</p>
      </div>
    );
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* BOTÓN ENTRADA */}
          <button
            onClick={() => handleRegister("entrada")}
            disabled={loading || hasEntrada}
            className={`flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg border-2 transition-all duration-300 transform shadow-sm ${
              loading || hasEntrada
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:scale-105"
            }`}
          >
            <span className="material-symbols-outlined text-5xl">login</span>
            <span className="text-xl font-semibold">Marcar Entrada</span>
          </button>

          {/* BOTÓN SALIDA */}
          <button
            onClick={() => handleRegister("salida")}
            disabled={loading}
            className={`flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg border-2 transition-all duration-300 transform shadow-sm ${
              loading
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:scale-105"
            }`}
          >
            <span className="material-symbols-outlined text-5xl">logout</span>
            <span className="text-xl font-semibold">Marcar Salida</span>
          </button>
        </div>

        {/* Mensaje informativo azul */}
        {renderInfoBox()}
      </div>

      {/*  Registro del día 
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
              <p className="font-semibold text-lg text-slate-800">
                {todayRecord?.horaEntrada || "--"}
              </p>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-2xl">
              logout
            </span>
            <div>
              <p className="text-sm">Salida</p>
              <p className="font-semibold text-lg text-slate-800">
                {todayRecord?.horaSalida || "--"}
              </p>
            </div>
          </div>
        </div>  */}
    </div>
  );
}
