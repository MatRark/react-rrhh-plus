import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

// Páginas
import Home from "./pages/Home";
import Empleados from "./pages/Empleados";
import Reclutamiento from "./pages/Reclutamiento";
import Evaluaciones from "./pages/Evaluaciones";
import Asistencias from "./pages/Asistencias";
import Contratos from "./pages/Contratos";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 Rutas fuera del layout (sin sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🔹 Rutas dentro del layout (con sidebar) */}
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/reclutamiento" element={<Reclutamiento />} />
          <Route path="/evaluaciones" element={<Evaluaciones />} />
          <Route path="/asistencias" element={<Asistencias />} />
          <Route path="/contratos" element={<Contratos />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
