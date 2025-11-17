// src/components/DetallePlantillaModal.jsx
import { X } from "lucide-react";

export default function DetallePlantillaModal({ plantilla, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{plantilla.nombre}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3 mb-6 text-sm">
          <p><strong>Área:</strong> {plantilla.nombre_area}</p>
          <p><strong>Periodo:</strong> {plantilla.periodo_inicio} — {plantilla.periodo_fin}</p>
          <p>
            <strong>Estado:</strong>{" "}
            <span className={plantilla.vigente ? "text-green-600" : "text-red-600"}>
              {plantilla.vigente ? "Vigente" : "No vigente"}
            </span>
          </p>
        </div>

        <h3 className="font-semibold mb-3">Indicadores</h3>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Indicador</th>
                <th className="p-2 text-right">Ponderación</th>
              </tr>
            </thead>
            <tbody>
              {plantilla.indicadores.map((i, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{i.nombre}</td>
                  <td className="p-2 text-right">{i.ponderacion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-5 py-2 border rounded-lg" onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
}
