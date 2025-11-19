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
      blue: { 
        bg: "bg-blue-100", 
        text: "text-blue-600", 
        hover: "hover:border-blue-400",
        gradient: "from-blue-500/10 to-blue-600/5"
      },
      green: { 
        bg: "bg-green-100", 
        text: "text-green-600", 
        hover: "hover:border-green-400",
        gradient: "from-green-500/10 to-green-600/5"
      },
      purple: { 
        bg: "bg-purple-100", 
        text: "text-purple-600", 
        hover: "hover:border-purple-400",
        gradient: "from-purple-500/10 to-purple-600/5"
      },
      orange: { 
        bg: "bg-orange-100", 
        text: "text-orange-600", 
        hover: "hover:border-orange-400",
        gradient: "from-orange-500/10 to-orange-600/5"
      },
      pink: { 
        bg: "bg-pink-100", 
        text: "text-pink-600", 
        hover: "hover:border-pink-400",
        gradient: "from-pink-500/10 to-pink-600/5"
      },
    };
    return colors[color] || colors.blue;
  };

  const visibleModules = modules.filter(m => canView(m.roles));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <section className="flex flex-col items-center text-center mb-16">
          
          <BlurFade delay={0.1} inView>
            <div className="relative">
              <h1 className="text-5xl font-bold tracking-tight text-slate-800 sm:text-6xl lg:text-7xl bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Sistema de Recursos Humanos
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-10 -z-10"></div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <p className="mt-6 text-2xl text-slate-600 sm:text-3xl">
              Bienvenido, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                {user.nombre || user.email || "Usuario"}
              </span>
            </p>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl leading-relaxed">
              Gestiona tu equipo de manera eficiente. Controla asistencias, nóminas, vacaciones y más desde un solo lugar.
            </p>
          </BlurFade>

        </section>

        <section className="mt-8">
          <BlurFade delay={0.4} inView>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Acceso Rápido a Módulos
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>
          </BlurFade>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleModules.map((module, index) => {
              const colorClasses = getColorClasses(module.color);
              return (
                <BlurFade key={module.to} delay={0.4 + (index * 0.04)} inView>
                  <div
                    onClick={() => navigate(module.to)}
                    className={`
                      relative group bg-white rounded-2xl shadow-lg border border-slate-200/80 
                      p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 
                      cursor-pointer overflow-hidden ${colorClasses.hover}
                      backdrop-blur-sm bg-white/80
                    `}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>
                    
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-5"></div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`${colorClasses.bg} rounded-xl p-3 shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        <span className={`material-symbols-outlined ${colorClasses.text} text-[32px]`}>
                          {module.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                          {module.label}
                        </h3>
                        <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </section>

        {visibleModules.length > 0 && (
          <BlurFade delay={0.4} inView>
            <section className="mt-20">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 text-center border border-blue-200/50">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Todo lo que necesitas en un solo lugar
                </h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Gestiona todos los aspectos de tus recursos humanos de manera integrada y eficiente. 
                  {visibleModules.length} módulos disponibles para optimizar tu workflow.
                </p>
              </div>
            </section>
          </BlurFade>
        )}

        <BlurFade delay={0.5} inView>
          <section className="mt-16 mb-8">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Equipo de Recursos Humanos colaborando"
                className="w-full h-64 sm:h-80 object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 mix-blend-overlay"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-white text-2xl sm:text-3xl font-bold mb-3">
                  Construyendo equipos excepcionales
                </h3>
                <p className="text-white/90 text-sm sm:text-base max-w-2xl">
                  Tu socio estratégico en la gestión del talento humano para el éxito organizacional
                </p>
              </div>
              
              <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute top-12 left-8 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-pulse delay-300"></div>
              <div className="absolute bottom-16 right-16 w-1 h-1 bg-green-400 rounded-full opacity-50 animate-pulse delay-700"></div>
            </div>
          </section>
        </BlurFade>

      </div>
    </div>
  );
}