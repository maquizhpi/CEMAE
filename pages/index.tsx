/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useAuth } from "../controllers/hooks/use_auth";
import HttpClient from "../controllers/utils/http_client";
import { Herramienta } from "../models";
import Sidebar from "./components/sidebar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Home() {
  const { auth } = useAuth();
  const [tableData, setTableData] = useState<Array<Herramienta>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    var response = await HttpClient("/api/herramientas", "GET", auth.usuario, auth.rol);
    const herramientas: Array<Herramienta> = response.data ?? [];
    setTableData(herramientas);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cálculo de métricas
  const totalHerramientas = tableData.length;
  const disponibles = tableData.filter(h => h.estado === "Disponible");
  const enUso = tableData.filter(h => h.estado === "En uso");
  const calibradas = tableData.filter(h => h.calibracion === "Calibrada");
  const noCalibradas = tableData.filter(h => h.calibracion === "No calibrada");

  // Datos para el gráfico
  const data = [
    { name: "Total", value: totalHerramientas },
    { name: "Disponibles", value: disponibles.length },
    { name: "En uso", value: enUso.length },
    { name: "Calibradas", value: calibradas.length },
    { name: "No calibradas", value: noCalibradas.length }
  ];

  // Función para generar un reporte en PDF con detalles
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
    <>
      <div className="flex h-screen">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 bg-blue-100">
          <div className="flex-1 p-6">
            <div className="bg-white w-full rounded-xl shadow-2xl p-8 mb-8">
              <div className="flex items-center mb-8">
                <p className="text-3xl text-center text-blue-800 font-bold w-full">
                  <strong>Sistema de Gestión de Herramientas</strong>
                </p>
                <hr className="mt-4 mb-6 border-t-2 border-blue-300" />
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-blue-200 p-4 rounded-lg text-center">
                  <p className="text-xl font-bold">{totalHerramientas}</p>
                  <p className="text-sm">Total Herramientas</p>
                </div>
                <div className="bg-green-200 p-4 rounded-lg text-center">
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
                <div className="bg-gray-300 p-4 rounded-lg text-center">
                  <p className="text-xl font-bold">{noCalibradas.length}</p>
                  <p className="text-sm">No Calibradas</p>
                </div>
              </div>

              {/* Gráfico */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-center text-xl font-bold mb-4">Estado de las Herramientas</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Botones para Exportar PDF */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <button
                  onClick={() => generatePDF("Reporte General de Herramientas", tableData)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Exportar Reporte General
                </button>
                <button
                  onClick={() => generatePDF("Reporte de Herramientas Disponibles", disponibles)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Exportar Disponibles
                </button>
                <button
                  onClick={() => generatePDF("Reporte de Herramientas en Uso", enUso)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  Exportar En Uso
                </button>
                <button
                  onClick={() => generatePDF("Reporte de Herramientas Calibradas", calibradas)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Exportar Calibradas
                </button>
                <button
                  onClick={() => generatePDF("Reporte de Herramientas No Calibradas", noCalibradas)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Exportar No Calibradas
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
