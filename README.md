# React RRHH Plus  by PLUS-GANG

Frontend del sistema **RRHH Plus**, un sistema web dirigido a las áreas de Recursos Humanos con el objetivo de **automatizar tareas** como:  
- Gestión de empleados  
- Control de asistencias  
- Evaluaciones de desempeño  
- Procesos de reclutamiento  

Este proyecto está desarrollado en **React** con **Vite**, utilizando **TailwindCSS** para estilos y **React Router** para la navegación.  

---

## Requisitos previos  

Asegúrate de tener instalado:  
- [Node.js](https://nodejs.org/) v18 o superior  
- npm (incluido con Node.js)  

---

## Instalación  

Clona el repositorio y entra en el directorio del proyecto:  

```bash
git clone https://github.com/MatRark/react-rrhh-plus.git
cd react-rrhh-plus
```
Instala las dependencias:

```bash
npm install
```

---

## Configuración

Si el proyecto requiere variables de entorno, crea un archivo .env en la raíz del proyecto.

Ejemplo:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Ejecución en desarrollo

Para iniciar el proyecto en modo desarrollo:

```bash
npm run dev
```
El proyecto estará disponible en:
- [http://localhost:5173/](http://localhost:5173/)

---

## Build para producción

Para generar una versión optimizada:

```bash
npm run build
```
El resultado se encontrará en la carpeta:

```bash
/dist
```

---

## Estructura de carpetas

La organización del código sigue un patrón modular por features, con separación de componentes reutilizables, páginas y servicios:

```bash
📁 react-rrhh-plus/
├── 📁 docs/               # Documentación del proyecto (lineamientos, guías, etc.)
│   └── Lineamientos_UI_UX_RHPlus.docx
├── 📁 public/
├── 📁 src/
│   ├── 📁 assets/         # Imágenes, íconos y recursos estáticos
│   ├── 📁 components/     # Componentes reutilizables (botones, inputs, modales, etc.)
│   ├── 📁 features/       # Módulos específicos del dominio (empleados, asistencias, etc.)
│   ├── 📁 hooks/          # Custom hooks para lógica reutilizable
│   ├── 📁 layouts/        # Layouts generales de la aplicación
│   ├── 📁 pages/          # Páginas del sistema (con React Router)
│   ├── 📁 services/       # Comunicación con APIs externas
│   ├── 📁 styles/         # Estilos globales y configuración de Tailwind
│   ├── 📁 utils/          # Funciones utilitarias y helpers
│   ├── 📄 App.jsx         # Configuración principal de la app
│   └── 📄 main.jsx        # Punto de entrada de la aplicación
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 README.md
└── 📄 .gitignore
```

--- 

## Lineamientos de Diseño (UI/UX)
## Prueba del WorkFlow

El proyecto **RRHH Plus Frontend** sigue una **guía de lineamientos UI/UX** que define los principios de diseño, componentes base, colores, tipografía y patrones de interacción.  
Estos lineamientos aseguran la **consistencia visual y de experiencia de usuario** en todas las interfaces del sistema.

📄 El documento completo se encuentra en:  
[`/docs/Lineamientos_UI_UX_RHPlus.docx`](./docs/Lineamientos_UI_UX_RHPlus.docx)

---

## Tecnologías principales

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [ESLint](https://eslint.org/)
