import React from "react";
import "tailwindcss/tailwind.css";

const Evaluaciones = () => {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* MAIN CONTENT */}
          <main className="flex w-full flex-1 justify-center py-8">
            <div className="flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
              {/* Título + Botón */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-72 flex-col gap-1">
                  <h1 className="text-4xl font-black tracking-tighter">Evaluaciones</h1>
                  <p className="text-base font-normal text-text-light-secondary dark:text-dark-secondary">
                    Crea, asigna, sigue y revisa las evaluaciones de los empleados.
                  </p>
                </div>
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-wide transition-colors hover:bg-primary/90">
                  <span className="material-symbols-outlined text-lg">add</span>
                  <span className="truncate">Crear Nueva Evaluación</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-6 border-b border-border-light dark:border-border-dark">
                <div className="flex gap-4 sm:gap-8">
                  <a className="flex flex-col items-center justify-center border-b-[3px] border-primary pb-3 pt-2" href="#">
                    <p className="text-sm font-bold text-primary">Todas</p>
                  </a>
                  <a className="group flex flex-col items-center justify-center border-b-[3px] border-transparent pb-3 pt-2" href="#">
                    <p className="text-sm font-bold text-text-light-secondary dark:text-dark-secondary transition-colors group-hover:text-text-light-primary dark:group-hover:text-dark-primary">
                      Borradores
                    </p>
                  </a>
                  <a className="group flex flex-col items-center justify-center border-b-[3px] border-transparent pb-3 pt-2" href="#">
                    <p className="text-sm font-bold text-text-light-secondary dark:text-dark-secondary transition-colors group-hover:text-text-light-primary dark:group-hover:text-dark-primary">
                      Activas
                    </p>
                  </a>
                  <a className="group flex flex-col items-center justify-center border-b-[3px] border-transparent pb-3 pt-2" href="#">
                    <p className="text-sm font-bold text-text-light-secondary dark:text-dark-secondary transition-colors group-hover:text-text-light-primary dark:group-hover:text-dark-primary">
                      Finalizadas
                    </p>
                  </a>
                </div>
              </div>

              {/* Buscador y filtro */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-grow">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-text-light-secondary dark:text-dark-secondary text-xl">search</span>
                  </div>
                  <input
                    className="form-input h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark pl-10 text-base placeholder:text-text-light-secondary dark:placeholder:text-dark-secondary focus:border-primary focus:ring-primary"
                    placeholder="Buscar por evaluación o empleado..."
                    type="search"
                  />
                </div>
                <div className="relative">
                  <select className="form-select h-12 appearance-none rounded-lg border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-base placeholder:text-text-light-secondary focus:border-primary focus:ring-primary">
                    <option>Filtrar por Departamento</option>
                    <option>Ingeniería</option>
                    <option>Diseño</option>
                    <option>Producto</option>
                    <option>Marketing</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <span className="material-symbols-outlined text-text-light-secondary dark:text-dark-secondary">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="mt-6 grid grid-cols-1 gap-6 @container md:grid-cols-2 xl:grid-cols-3">
                {/* CARD 1 */}
                <div className="flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-sm transition-shadow hover:shadow-lg">
                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between">
                      <p className="text-lg font-bold tracking-tight">Evaluación de Desempeño Q3 2024</p>
                      <div className="whitespace-nowrap rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Activa
                      </div>
                    </div>
                    <div className="text-sm text-text-light-secondary dark:text-dark-secondary">
                      <p>
                        Asignado a:{" "}
                        <span className="font-medium text-text-light-primary dark:text-dark-primary">
                          Departamento de Ingeniería
                        </span>
                      </p>
                      <p>
                        Fecha límite:{" "}
                        <span className="font-medium text-text-light-primary dark:text-dark-primary">
                          30 de Septiembre, 2024
                        </span>
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-text-light-secondary dark:text-dark-secondary">
                        <span>Progreso</span>
                        <span>75%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-teal-500" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-border-light dark:border-border-dark p-4">
                    <button className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-3 bg-primary/10 text-primary text-sm font-medium transition-colors hover:bg-primary/20">
                      <span className="truncate">Recordar</span>
                    </button>
                    <button className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-3 bg-primary text-white text-sm font-medium transition-colors hover:bg-primary/90">
                      <span className="truncate">Ver Resultados</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Evaluaciones;
