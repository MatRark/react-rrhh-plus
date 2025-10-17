import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

// Protecciones
import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute";

// Páginas
import Home from "./pages/Home";
import Empleados from "./pages/Empleados";
import Reclutamiento from "./pages/Reclutamiento";
import Evaluaciones from "./pages/Evaluaciones";
import Asistencias from "./pages/Asistencias";
import Contratos from "./pages/Contratos";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { isAuthenticated } from "./services/authService";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
       {/* Ruta raíz dinámica */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to="/home" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />

        {/* Rutas privadas (requieren login) */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/home" element={<Home />} />

            {/* Rutas con control de roles */}
            <Route element={<RoleRoute allowedRoles={["admin", "Gestor de Empleados"]} />}>
              <Route path="/empleados" element={<Empleados />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["Administrador","admin", "Reclutador"]} />}>
              <Route path="/reclutamiento" element={<Reclutamiento />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["Administrador","admin", "Evaluador"]} />}>
              <Route path="/evaluaciones" element={<Evaluaciones />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["Administrador","admin", "Operador de Asistencia"]} />}>
              <Route path="/asistencias" element={<Asistencias />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["Administrador","admin"]} />}>
              <Route path="/contratos" element={<Contratos />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
