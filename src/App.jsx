// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Empleados from "./pages/Empleados";
import Reclutamiento from "./pages/Reclutamiento";
import Evaluaciones from "./pages/Evaluaciones";
import Asistencias from "./pages/Asistencias";
import Contratos from "./pages/Contratos";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="reclutamiento" element={<Reclutamiento />} />
          <Route path="evaluaciones" element={<Evaluaciones />} />
          <Route path="asistencias" element={<Asistencias />} />
          <Route path="contratos" element={<Contratos />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}