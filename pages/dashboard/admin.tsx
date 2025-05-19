/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useAuth } from "../../controllers/hooks/use_auth";
import HttpClient from "../../controllers/utils/http_client";
import { Herramienta, Bodega } from "../../models";
import Sidebar from "../components/sidebar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DashboardAdmin() {
  const { auth } = useAuth();
  const [tableData, setTableData] = useState<Array<Herramienta>>([]);
  const [bodegas, setBodegas] = useState<Array<Bodega>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const responseHerr = await HttpClient("/api/herramientas", "GET", auth.usuario, auth.rol);
    const responseBod = await HttpClient("/api/bodegas", "GET", auth.usuario, auth.rol);
    const responseUsers = await HttpClient("/api/user", "GET", auth.usuario, auth.rol);

    setTableData(responseHerr.data ?? []);
    setBodegas(responseBod.data ?? []);
    setLoading(false);
    setUsuarios(responseUsers.data ?? []);
  };
  

  useEffect(() => {
    loadData();
  }, []);

  const totalHerramientas = tableData.length;
  const disponibles = tableData.filter(h => h.estado === "Disponible");
  const enUso = tableData.filter(h => h.estado === "En uso");
  const calibradas = tableData.filter(h => h.calibracion === "Calibrada");
  const noCalibradas = tableData.filter(h => h.calibracion === "No calibrada");
  const [usuarios, setUsuarios] = useState<Array<any>>([]);

  const usuariosPorRol = [
    {
        name: "AdministradorSistema",
        value: usuarios.filter(u => u.rol === 0).length,
    },
    {
        name: "Bodeguero",
        value: usuarios.filter(u => u.rol === 1).length,
    },
    {
        name: "Cliente",
        value: usuarios.filter(u => u.rol === 2).length,
    },
    ];




  const herramientasPorBodega = bodegas.map((bodega) => ({
    name: bodega.nombreBodega,
    value: bodega.herramientas?.length || 0,
    }));


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
            <p className="text-3xl text-center text-blue-800 font-bold mb-4">
              Dashboard del Administrador
            </p>

            {/* Métricas Globales */}
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
            

            {/* Gráfica por Bodega */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-center text-xl font-bold mb-4">Herramientas por Bodega</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={herramientasPorBodega} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0072CC" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lista de Bodegas */}
            <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-xl font-bold mb-4 text-blue-800 text-center">Bodegas Registradas</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border-b">#</th>
                    <th className="py-2 px-4 border-b">Nombre</th>
                    <th className="py-2 px-4 border-b">Bodeguero Asignado</th>
                    <th className="py-2 px-4 border-b">Creador</th>
                    <th className="py-2 px-4 border-b">Fecha de creación</th>
                    </tr>
                </thead>
                <tbody>
                    {bodegas.map((bodega, index) => (
                    <tr key={(bodega as any)._id}>
                        <td className="py-2 px-4 border-b">{index + 1}</td>
                        <td className="py-2 px-4 border-b">{bodega.nombreBodega}</td>
                        <td className="py-2 px-4 border-b">{bodega.bodegueroAsignado || "Sin asignar"}</td>
                        <td className="py-2 px-4 border-b">{bodega.creador || "N/A"}</td>
                        <td className="py-2 px-4 border-b">{bodega.fechaDeCreacion || "N/A"}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

            {/* Gráfica de Usuarios por Rol */}
            <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-center text-xl font-bold mb-4 text-blue-800">Usuarios por Rol</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usuariosPorRol} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#34a853" />
                </BarChart>
            </ResponsiveContainer>
            </div>

            {/* Tabla Lista de Usuarios */}
            <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-xl font-bold mb-4 text-blue-800 text-center">Lista de Usuarios</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left">
                    <th className="py-2 px-4 border-b">#</th>
                    <th className="py-2 px-4 border-b">Nombre</th>
                    <th className="py-2 px-4 border-b">Usuario</th>
                    <th className="py-2 px-4 border-b">Correo</th>
                    <th className="py-2 px-4 border-b">Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario, index) => (
                    <tr key={usuario._id}>
                        <td className="py-2 px-4 border-b">{index + 1}</td>
                        <td className="py-2 px-4 border-b">{usuario.nombre || "Sin nombre"}</td>
                        <td className="py-2 px-4 border-b">{usuario.usuario || "Sin usuario"}</td>
                        <td className="py-2 px-4 border-b">{usuario.correo || "Sin correo"}</td>
                        <td className="py-2 px-4 border-b">
                        {usuario.rol === 0
                            ? "AdministradorSistema"
                            : usuario.rol === 1
                            ? "Bodeguero"
                            : "Cliente"}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>

            {/* Exportación */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <button onClick={() => generatePDF("Reporte General de Herramientas", tableData)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
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
