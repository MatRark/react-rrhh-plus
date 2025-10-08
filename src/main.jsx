import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import "./styles/App.css";



// páginas
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Empleados from './pages/Empleados.jsx'
import Contratos from './pages/Contratos.jsx'
import Asistencias from './pages/Asistencias.jsx'
import Evaluaciones from './pages/Evaluaciones.jsx'
import Reclutamiento from './pages/Reclutamiento.jsx'
import NotFound from './pages/NotFound.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Login /> },        // 👈 Página inicial ahora es Login
  { path: '/home', element: <Home /> },     // 👈 Panel de control
  { path: '/empleados', element: <Empleados /> },
  { path: '/contratos', element: <Contratos /> },
  { path: '/asistencias', element: <Asistencias /> },
  { path: '/evaluaciones', element: <Evaluaciones /> },
  { path: '/reclutamiento', element: <Reclutamiento /> },
  { path: '*', element: <NotFound /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
