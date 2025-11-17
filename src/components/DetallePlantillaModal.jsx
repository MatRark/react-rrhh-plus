import { X } from 'lucide-react';

export default function DetallePlantillaModal({ plantilla, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{plantilla.nombre}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700 mb-6">
          <div><strong>Área:</strong> {plantilla.nombre_area}</div>
          <div>
            <strong>Periodo:</strong>{' '}
            {new Date(plantilla.periodo_inicio).toLocaleDateString('es-MX')} al{' '}
            {new Date(plantilla.periodo_fin).toLocaleDateString('es-MX')}
          </div>
          <div>
            <strong>Estado:</strong>{' '}
            <span className={plantilla.vigente ? 'text-green-600' : 'text-red-600'}>
              {plantilla.vigente ? 'Vigente' : 'No vigente'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Indicadores</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4 font-medium text-gray-600">Indicador</th>
                  <th className="text-right py-2 px-4 font-medium text-gray-600">Ponderación</th>
                </tr>
              </thead>
              <tbody>
                {plantilla.indicadores?.map((i, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 px-4">{i.nombre}</td>
                    <td className="py-2 px-4 text-right font-medium">{i.ponderacion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}