/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useAuth } from "../../controllers/hooks/use_auth";
import HttpClient from "../../controllers/utils/http_client";
import Sidebar from "../components/sidebar";
import { Herramienta, Bodega } from "../../models";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { generateReporteSolicitudes } from "../solicitudes/reporte/reporteSolicitudes";
import { generateReporteCalibraciones } from "../calibracion/reporte/reporteCalibraciones";
import { generateReporteHerramienta } from "../bodegas/reporte/reporteHerramientas";

export default function DashboardBodeguero() {
  const { auth } = useAuth();
  const [bodegas, setBodegas] = useState<Array<Bodega>>([]);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Función para cargar las bodegas asignadas al usuario actual
  const loadData = async () => {
    setLoading(true);
    const responseBod = await HttpClient(
      "/api/bodegas", 
      "GET", 
      auth.usuario, 
      auth.rol);

      console.log("Nombre del usuario autenticado:", auth.nombre);


    const bodegasFiltradas = (responseBod.data ?? []).filter((b: Bodega) => b.bodegueroAsignado?.nombre === auth.nombre);
    setBodegas(bodegasFiltradas);
    // Selecciona la primera bodega por defecto
    setBodegaSeleccionada(bodegasFiltradas[0]?._id || "");
    setLoading(false);
  };

  //Función para cargar las solicitudes asignadas al usuario actual
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const loadSolicitudes = async () => {
    if (!auth?.usuario) return;
    try {
      const response = await HttpClient(
        "/api/solicitudes",
        "GET",
        auth.usuario,
        auth.rol
      );
      // Filtra las solicitudes realizadas por el usuario actual
      const solicitudesUsuario = (response.data ?? []).filter(
        (s: any) => s.bodeguero?.nombre === auth.nombre
      );
      console.log("Todas las solicitudes:", response.data);

      setSolicitudes(solicitudesUsuario);
      console.log("Solicitudes cargadas:", solicitudesUsuario);
    } catch (error) {
      setSolicitudes([]);
    }
  };

  // Función para cargar las calibraciones asignadas al usuario actual
  const [calibraciones, setCalibraciones] = useState<any[]>([]);
  const loadCalibraciones = async () => {
    if (!auth?.usuario) return;
    try {
      const response = await HttpClient(
        "/api/calibracion",
        "GET",
        auth.usuario,
        auth.rol
      );
      // Filtra las calibraciones asignadas al usuario actual
      const calibracionesUsuario = (response.data ?? []).filter(
        (c: any) => c.bodeguero?.trim().toLowerCase() === auth.nombre?.trim().toLowerCase()
);
      console.log("Todas las calibraciones:", response.data);

      setCalibraciones(calibracionesUsuario);
      console.log("Calibraciones cargadas:", calibracionesUsuario);
    } catch (error) {
      setCalibraciones([]);
    }
  };

  //// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
    loadSolicitudes();
    loadCalibraciones();
  }, []);

  // Encuentra la bodega seleccionada
  const bodegaActual = bodegas.find(b => b.id === bodegaSeleccionada);
  // Herramientas de la bodega seleccionada
  const herramientasPorBodega: Herramienta[] = bodegaActual?.herramientas ?? [];

  // Estadísticas de herramientas
  const total = herramientasPorBodega.length;
  const disponibles = herramientasPorBodega.filter(h => h.estado === "Disponible");
  const enUso = herramientasPorBodega.filter(h => h.estado === "En uso");
  const calibradas = herramientasPorBodega.filter(h => h.calibracion === "Calibrada");
  const noCalibradas = herramientasPorBodega.filter(h => h.calibracion === "No calibrada");

  // Estadísticas de solicitudes
  const solicitudesRealizadas = solicitudes.length;
  const solicitudesEntregadas = solicitudes.filter(s => s.estado === "ENTREGADO");
  const solicitudesNoEntregadas = solicitudes.filter(s => s.estado == "NO ENTREGADO");
  const solicitudesPendientes = solicitudes.filter(s => s.estado == "PENDIENTE");

  // Estadísticas de solicitudes de calibraciones
  const calibracionesSolicitadas = calibraciones.length;
  const calibracionesRealizadas = calibraciones.filter(c => c.estado === "Herramientas calibradas");
  const calibracionesPendientes = calibraciones.filter(c => c.estado == "En calibracion");
  // Calibraciones vencidas: aquellas cuya fecha de próxima calibración es anterior a hoy
  const calibracionVencida = calibraciones.filter(c => {
    if (!c.fechaProximaCalibracion) return false;
    const proxima = new Date(c.fechaProximaCalibracion);
    const hoy = new Date();
    // Si la fecha de próxima calibración ya pasó, se considera caducado
    return proxima < hoy;
  });

  // Datos para la gráfica herramientas
  const data = [
    { name: "Disponibles", value: disponibles.length },
    { name: "En Uso", value: enUso.length },
    { name: "Calibradas", value: calibradas.length },
    { name: "No Calibradas", value: noCalibradas.length },
  ];

    // Datos para la gráfica herramientas
  const dataSolicitud = [
    { name: "Solicitudes Realizadas", value: solicitudesRealizadas },
    { name: "Solicitudes Entregadas", value: solicitudesEntregadas.length },
    { name: "Solicitudes No Entregadas", value: solicitudesNoEntregadas.length },
    { name: "Solicitudes Pendientes", value: solicitudesPendientes.length },
  ];

  // Datos para la gráfica calibraciones  
  const dataCalibraciones = [
    { name: "Calibraciones Solicitadas", value: calibracionesSolicitadas},
    { name: "Calibraciones Realizadas", value: calibracionesRealizadas.length },
    { name: "Calibraciones Pendientes", value: calibracionesPendientes.length },
    { name: "Calibracion Vencida", value: calibracionVencida.length },
  ];

  return (
    <div className="flex h-screen">
      {/* Barra lateral */}
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      {/* Contenido principal */}
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

            {/* Estadísticas rápidas */}
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
              <div className="bg-purple-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{solicitudesPendientes.length}</p>
                <p className="text-sm">Solicitudes Pendientes</p>
              </div>
              <div className="bg-pink-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{solicitudesNoEntregadas.length}</p>
                <p className="text-sm">Solicitudes No Entregadas</p>
              </div>
              <div className="bg-orange-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{calibracionesRealizadas.length}</p>
                <p className="text-sm">Calibraciones Realizadas</p>
              </div>
              <div className="bg-gray-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{calibracionVencida.length}</p>
                <p className="text-sm">Calibración Vencida</p>
              </div>
            </div>

            {/* Gráfica de barras herramientas */}
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
            {/* Gráfica de barras solicitudes */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-center text-xl font-bold mb-4 text-blue-800">Estado de Solicitudes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataSolicitud} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {dataSolicitud.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Solicitudes Realizadas" ? "#7C3AED" :
                          entry.name === "Solicitudes Entregadas" ? "#10B981" :
                          entry.name === "Solicitudes No Entregadas" ? "#FBBF24" :
                          "#F43F5E"
                        }
                    />
                    ))}
                </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Gráfica de barras calibraciones */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-center text-xl font-bold mb-4 text-blue-800">Estado de Calibraciones</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataCalibraciones} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {dataCalibraciones.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "Calibraciones Solicitadas" ? "#A78BFA" :
                        entry.name === "Calibraciones Realizadas" ? "#34D399" :
                        entry.name === "Calibraciones Pendientes" ? "#FBBF24" :
                        "#F43F5E"
                      }
                    />
                    ))}
                </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Botones de exportación */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <button
                onClick={() => generateReporteHerramienta("Reporte General de Herramientas", herramientasPorBodega)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Exportar Reporte General
              </button>

              <button
                onClick={() => generateReporteHerramienta("Herramientas Disponibles", disponibles)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Exportar Disponibles
              </button>

              <button
                onClick={() => generateReporteHerramienta("Herramientas en Uso", enUso)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                Exportar En Uso
              </button>

              <button
                onClick={() => generateReporteHerramienta("Herramientas Calibradas", calibradas)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Exportar Calibradas
              </button>

              <button
                onClick={() => generateReporteHerramienta("Herramientas No Calibradas", noCalibradas)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Exportar No Calibradas
              </button>
              <button
                onClick={() => generateReporteSolicitudes("Solicitudes de Herramientas", solicitudes)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
              >
                Exportar Solicitudes Herramientas
              </button>

              <button
                onClick={() => generateReporteSolicitudes("Solicitudes No Entregadas", solicitudes.filter(s => s.estado === "NO ENTREGADO"))}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
              >
                Exportar Solicitudes No Entregadas
              </button>
              <button
                onClick={() => generateReporteCalibraciones("Calibraciones Realizadas", calibracionesRealizadas)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Exportar Calibraciones Realizadas
              </button>
              <button
                onClick={() => generateReporteCalibraciones("Calibraciones Pendientes", calibracionesPendientes)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                Exportar Calibraciones Pendientes
              </button>
              <button
                onClick={() => generateReporteCalibraciones("Calibraciones Caducadas", calibracionVencida)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Exportar Calibraciones Caducadas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}