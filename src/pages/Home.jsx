import React from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../services/authService";
import { BlurFade } from "../components/ui/blur-fade";
import { Globe } from "../components/ui/globe";

export default function Home() {
  const user = getUserInfo();
  const navigate = useNavigate();
  const roles = user.roles || [];

  const canView = (allowedRoles) => {
    if (allowedRoles.includes("*")) return true;
    return roles.some(r => allowedRoles.includes(r));
  };

  const modules = [
    { 
      to: "/empleados", 
      icon: "groups", 
      label: "Empleados", 
      description: "Administra la información de tu equipo",
      color: "blue",
      roles: ["admin", "gestor_empleados"] 
    },
    { 
      to: "/reclutamiento", 
      icon: "work", 
      label: "Reclutamiento", 
      description: "Gestiona vacantes y candidatos",
      color: "green",
      roles: ["admin", "reclutador"] 
    },
    { 
      to: "/evaluaciones", 
      icon: "grade", 
      label: "Evaluaciones", 
      description: "Evalúa el desempeño del equipo",
      color: "purple",
      roles: ["admin", "evaluador", "reclutador", "empleado"] 
    },
    { 
      to: "/asistencias", 
      icon: "event_available", 
      label: "Asistencias", 
      description: "Registra y consulta asistencias",
      color: "orange",
      roles: ["admin", "gestor_empleados", "operador_asistencia", "empleado"] 
    },
    { 
      to: "/contratos", 
      icon: "request_quote", 
      label: "Contratos", 
      description: "Gestiona contratos y documentos",
      color: "pink",
      roles: ["admin", "gestor_empleados", "empleado"] 
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", hover: "hover:border-blue-400" },
      green: { bg: "bg-green-100", text: "text-green-600", hover: "hover:border-green-400" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", hover: "hover:border-purple-400" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", hover: "hover:border-orange-400" },
      pink: { bg: "bg-pink-100", text: "text-pink-600", hover: "hover:border-pink-400" },
    };
    return colors[color] || colors.blue;
  };

  const visibleModules = modules.filter(m => canView(m.roles));

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center">
          
          {/* Título Principal */}
          <BlurFade delay={0.25}>
            <h1 className="text-5xl font-bold tracking-tight text-slate-800 sm:text-6xl">
              Sistema de Recursos Humanos
            </h1>
          </BlurFade>

          {/* Subtítulo Personalizado */}
          <BlurFade delay={0.4}>
            <p className="mt-4 text-2xl text-slate-600 sm:text-3xl">
              Bienvenido, <span className="text-blue-600 font-semibold">{user.nombre || user.email || "Usuario"}</span>
            </p>
          </BlurFade>

          {/* Descripción */}
          <BlurFade delay={0.55}>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl">
              Gestiona tu equipo de manera eficiente. Controla asistencias, nóminas, vacaciones y más desde un solo lugar.
            </p>
          </BlurFade>

        </section>

        {/* Cards de Módulos del Sistema */}
        <section className="mt-16">
          <BlurFade delay={0.7}>
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Acceso Rápido a Módulos</h2>
          </BlurFade>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleModules.map((module, index) => {
              const colorClasses = getColorClasses(module.color);
              return (
                <BlurFade key={module.to} delay={0.8 + (index * 0.1)}>
                  <div
                    onClick={() => navigate(module.to)}
                    className={`
                      bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 
                      hover:shadow-lg transition-all duration-300 hover:scale-105 
                      cursor-pointer ${colorClasses.hover}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${colorClasses.bg} rounded-lg p-3 shrink-0`}>
                        <span className={`material-symbols-outlined ${colorClasses.text} text-[32px]`}>
                          {module.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                          {module.label}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {module.description}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </section>

        {/*
        <section className="mt-16">
          <BlurFade delay={1.5}>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Vista General</h2>
          </BlurFade>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            <BlurFade delay={1.6}>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Empleados Activos</p>
                    <p className="text-4xl font-bold mt-2">---</p>
                  </div>
                  <span className="material-symbols-outlined text-[48px] opacity-50">
                    groups
                  </span>
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={1.7}>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Asistencias Hoy</p>
                    <p className="text-4xl font-bold mt-2">---</p>
                  </div>
                  <span className="material-symbols-outlined text-[48px] opacity-50">
                    fact_check
                  </span>
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={1.8}>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Solicitudes Pendientes</p>
                    <p className="text-4xl font-bold mt-2">---</p>
                  </div>
                  <span className="material-symbols-outlined text-[48px] opacity-50">
                    notifications_active
                  </span>
                </div>
              </div>
            </BlurFade>

          </div>
        </section>*/}

        {/* Imagen Pie de Página */}
        <section className="mt-20 mb-8">
          <BlurFade delay={1.9}>
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://www.shutterstock.com/image-photo/double-exposure-group-businessperson-cityscape-600nw-1409286710.jpg" 
                alt="Equipo de Recursos Humanos"
                className="w-full h-64 sm:h-80 object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2">
                  Construyendo equipos excepcionales
                </h3>
                <p className="text-white/90 text-sm sm:text-base">
                  Tu socio estratégico en la gestión del talento humano
                </p>
              </div>
            </div>
          </BlurFade>
        </section>

      </div>
    </div>
  );
}