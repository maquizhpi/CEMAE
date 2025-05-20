/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useAuth } from "../../controllers/hooks/use_auth";
import HttpClient from "../../controllers/utils/http_client";
import Sidebar from "../components/sidebar";
import { Herramienta, Bodega } from "../../models";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DashboardBodeguero() {
  const { auth } = useAuth();
  const [bodegas, setBodegas] = useState<Array<Bodega>>([]);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const responseBod = await HttpClient("/api/bodegas", "GET", auth.usuario, auth.rol);
    const bodegasFiltradas = (responseBod.data ?? []).filter((b: Bodega) => b.bodegueroAsignado === auth.usuario);
    setBodegas(bodegasFiltradas);
    setBodegaSeleccionada(bodegasFiltradas[0]?._id || "");
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const bodegaActual = bodegas.find(b => b.id === bodegaSeleccionada);
  const herramientasPorBodega: Herramienta[] = bodegaActual?.herramientas ?? [];

  const total = herramientasPorBodega.length;
  const disponibles = herramientasPorBodega.filter(h => h.estado === "Disponible");
  const enUso = herramientasPorBodega.filter(h => h.estado === "En uso");
  const calibradas = herramientasPorBodega.filter(h => h.calibracion === "Calibrada");
  const noCalibradas = herramientasPorBodega.filter(h => h.calibracion === "No calibrada");

  const data = [
    { name: "Disponibles", value: disponibles.length },
    { name: "En Uso", value: enUso.length },
    { name: "Calibradas", value: calibradas.length },
    { name: "No Calibradas", value: noCalibradas.length }
  ];

  const generatePDF = (title: string, herramientas: Herramienta[]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 10);

    if (herramientas.length === 0) {
      doc.text("No hay herramientas registradas en esta categoría.", 14, 20);
    } else {
      const headers = [["Nombre", "Código", "Marca", "Serie", "Ubicación", "Cantidad"]];
      const data = herramientas.map(h => [h.nombre, h.codigo, h.marca, h.serie, h.ubicacion, h.cantidad]);

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 20,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 122, 204] },
      });
    }

    doc.save(`${title}.pdf`);
  };

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 overflow-y-scroll">
        <div className="flex-1 p-6">
          <div className="bg-white w-full rounded-xl shadow-2xl p-8 mb-8">
            <h2 className="text-3xl text-center text-blue-800 font-bold mb-6">
              Dashboard del Bodeguero
            </h2>

            {/* Selector de bodega */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-blue-800">Seleccione una bodega:</label>
              <select
                value={bodegaSeleccionada}
                onChange={(e) => setBodegaSeleccionada(e.target.value)}
                className="w-full p-2 border rounded-lg shadow-sm"
              >
                {bodegas.map(b => (
                  <option key={b.id} value={b.id}>{b.nombreBodega}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{total}</p>
                <p className="text-sm">Total Herramientas</p>
              </div>
              <div className="bg-blue-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{disponibles.length}</p>
                <p className="text-sm">Disponibles</p>
              </div>
              <div className="bg-red-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{enUso.length}</p>
                <p className="text-sm">En Uso</p>
              </div>
              <div className="bg-yellow-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{calibradas.length}</p>
                <p className="text-sm">Calibradas</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-center text-xl font-bold mb-4 text-blue-800">Estado de Herramientas</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {data.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={
                        entry.name === "Disponibles" ? "#3B82F6" :
                        entry.name === "En Uso" ? "#EF4444" :
                        entry.name === "Calibradas" ? "#FACC15" :
                        "#9CA3AF"
                        }
                    />
                    ))}
                </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Exportación */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <button onClick={() => generatePDF("Reporte General de Herramientas", herramientasPorBodega)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Exportar Reporte General
              </button>
              <button onClick={() => generatePDF("Herramientas Disponibles", disponibles)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                Exportar Disponibles
              </button>
              <button onClick={() => generatePDF("Herramientas en Uso", enUso)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
                Exportar En Uso
              </button>
              <button onClick={() => generatePDF("Herramientas Calibradas", calibradas)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Exportar Calibradas
              </button>
              <button onClick={() => generatePDF("Herramientas No Calibradas", noCalibradas)} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                Exportar No Calibradas
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}