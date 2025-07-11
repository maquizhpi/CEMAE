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
import { generateReporteBodegas } from "../bodegas/reporte/reporteBodegas";

export default function DashboardGlobal() {
  const { auth } = useAuth();
  const [bodegas, setBodegas] = useState<Array<Bodega>>([]);
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [calibraciones, setCalibraciones] = useState<any[]>([]);

  const loadData = async () => {
    const responseBod = await HttpClient("/api/bodegas", "GET", auth.usuario, auth.rol);
    const responseSol = await HttpClient("/api/solicitudes", "GET", auth.usuario, auth.rol);
    const responseCal = await HttpClient("/api/calibracion", "GET", auth.usuario, auth.rol);

    const allBodegas = responseBod.data ?? [];
    setBodegas(allBodegas);

    const herramientasPorBodega = bodegas.map((bodega) => ({
      name: bodega.nombreBodega,
      value: bodega.herramientas?.length || 0,
    }));


    const allHerramientas = allBodegas.flatMap((b: Bodega) => b.herramientas ?? []);
    setHerramientas(allHerramientas);

    setSolicitudes(responseSol.data ?? []);
    setCalibraciones(responseCal.data ?? []);
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  }, []);

  const herramientasPorBodega = bodegas.map((bodega) => ({
  name: bodega.nombreBodega,
  value: bodega.herramientas?.length || 0,
  }));
// Filtrar herramientas por estado y calibración
  const total = herramientas.length;
  const disponibles = herramientas.filter(h => h.estado === "Disponible");
  const enUso = herramientas.filter(h => h.estado === "En uso");
  const calibradas = herramientas.filter(h => h.calibracion === "Calibrada");
  const noCalibradas = herramientas.filter(h => h.calibracion === "No calibrada");

  // Filtrar solicitudes por estado
  const solicitudesRealizadas = solicitudes.length;
  const solicitudesEntregadas = solicitudes.filter(s => s.estado === "ENTREGADO");
  const solicitudesNoEntregadas = solicitudes.filter(s => s.estado == "NO ENTREGADO");
  const solicitudesPendientes = solicitudes.filter(s => s.estado == "PENDIENTE");

  // Filtrar calibraciones por estado
  const calibracionesSolicitadas = calibraciones.length;
  const calibracionesRealizadas = calibraciones.filter(c => c.estado === "Herramientas calibradas");
  const calibracionesPendientes = calibraciones.filter(c => c.estado == "En calibracion");
  const calibracionVencida = calibraciones.filter(c => {
    if (!c.fechaProximaCalibracion) return false;
    return new Date(c.fechaProximaCalibracion) < new Date();
  });

  // Preparar datos para las gráficas
  const data = [
    { name: "Disponibles", value: disponibles.length },
    { name: "En Uso", value: enUso.length },
    { name: "Calibradas", value: calibradas.length },
    { name: "No Calibradas", value: noCalibradas.length },
  ];

  const dataSolicitud = [
    { name: "Solicitudes Realizadas", value: solicitudesRealizadas },
    { name: "Entregadas", value: solicitudesEntregadas.length },
    { name: "No Entregadas", value: solicitudesNoEntregadas.length },
    { name: "Pendientes", value: solicitudesPendientes.length },
  ];

  const dataCalibraciones = [
    { name: "Solicitadas", value: calibracionesSolicitadas },
    { name: "Realizadas", value: calibracionesRealizadas.length },
    { name: "Pendientes", value: calibracionesPendientes.length },
    { name: "Vencidas", value: calibracionVencida.length },
  ];

  // Componente para sección colapsable
  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="mb-6 border rounded-lg shadow-md bg-white">
        <div
          onClick={() => setOpen(!open)}
          className="cursor-pointer px-6 py-4 bg-blue-200 font-semibold text-blue-800 text-xl flex justify-between items-center"
        >
          <span>{title}</span>
          <span>{open ? "▲" : "▼"}</span>
        </div>
        {open && <div className="p-6">{children}</div>}
      </div>
    );
  };

// pagina principal del dashboard global del administrador
return (
  <div className="flex h-screen">
    <div className="md:w-1/6 max-w-none">
      <Sidebar />
    </div>
    <div className="w-12/12 md:w-5/6 bg-blue-100 overflow-y-scroll">
      <div className="flex-1 p-6">
        <div className="bg-white w-full rounded-xl shadow-2xl p-6 mb-8">
          <h2 className="text-3xl text-center text-blue-800 font-bold mb-6">
            Dashboard Global del Administrador
          </h2>

          <Section title="Bodegas y Herramientas Registradas">
            {/* Cards de bodegas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bodegas.map((bodega, index) => (
                <div
                  key={bodega.id}
                  className={`p-4 rounded-lg text-center shadow-md ${
                    index % 3 === 0
                      ? 'bg-green-200'
                      : index % 3 === 1
                      ? 'bg-blue-200'
                      : 'bg-yellow-200'
                  }`}
                >
                  <p className="text-lg font-semibold text-blue-800 uppercase">{bodega.nombreBodega}</p>
                  <p className="text-sm mt-1">Herramientas Registradas:</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bodega.herramientas?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Métricas de Herramientas">
                       <h3 className="text-3xl text-center text-blue-900 mb-6">
              Métricas herramientas
            </h3>
            {/* Métricas herramientas*/}
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
              <div className="bg-gray-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{noCalibradas.length}</p>
                <p className="text-sm">No Calibradas</p>
              </div>
            </div>
            <h3 className="text-3xl text-center text-blue-900 mb-6">
              Gráfico de herramientas
            </h3>
            {/* Gráficas */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
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
          </Section>

          <Section title="Métricas de Solicitudes">
                        <h3 className="text-3xl text-center text-blue-900 mb-6">
              Métricas de solicitudes
            </h3>
            {/* Métricas Solicitudes*/}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">              
              <div className="bg-blue-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{solicitudesRealizadas}</p>
                <p className="text-sm">Solicitudes Realizadas</p>
              </div>
              <div className="bg-green-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{solicitudesEntregadas.length}</p>
                <p className="text-sm">Entregadas</p>
              </div>
              <div className="bg-red-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{solicitudesNoEntregadas.length}</p>
                <p className="text-sm">No Entregadas</p>
              </div>
              <div className="bg-yellow-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{solicitudesPendientes.length}</p>
                <p className="text-sm">Pendientes</p>
              </div>   
            </div>
            <h3 className="text-3xl text-center text-blue-900 mb-6">
              Gráfico de solicitudes
            </h3>
            <ResponsiveContainer width="100%" height={300} className="mt-8">
              <BarChart data={dataSolicitud} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  {dataSolicitud.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "Solicitudes Realizadas" ? "#3B82F6" :
                        entry.name === "Entregadas" ? "#10B981" :
                        entry.name === "No Entregadas" ? "#EF4444" :
                        "#9CA3AF"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Métricas de Calibraciones">
                        <h3 className="text-3xl text-center text-blue-900 mb-6">
              Métricas de calibraciones
            </h3>
            {/* Métricas Calibraciones*/}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

              <div className="bg-blue-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{calibracionesSolicitadas}</p>
                <p className="text-sm">Solicitadas</p>
              </div>
              <div className="bg-green-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{calibracionesRealizadas.length}</p>
                <p className="text-sm">Realizadas</p>
              </div>
              <div className="bg-yellow-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{calibracionesPendientes.length}</p>
                <p className="text-sm">Pendientes</p>
              </div>
              <div className="bg-red-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{calibracionVencida.length}</p>
                <p className="text-sm">Vencidas</p>
              </div> 
            </div>
            <h3 className="text-3xl text-center text-blue-900 mb-6">
              Gráfico de calibraciones
            </h3>
            <ResponsiveContainer width="100%" height={300} className="mt-8">
              <BarChart data={dataCalibraciones} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  {dataCalibraciones.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "Solicitadas" ? "#3B82F6" :
                        entry.name === "Realizadas" ? "#10B981" :
                        entry.name === "Pendientes" ? "#F59E0B" :
                        "#EF4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Exportar Reportes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <button onClick={() => generateReporteHerramienta("Reporte Global Herramientas", herramientas)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Exportar Herramientas</button>
              <button onClick={() => generateReporteSolicitudes("Reporte Global Solicitudes", solicitudes)} className="bg-green-600 text-white px-4 py-2 rounded-lg">Exportar Solicitudes</button>
              <button onClick={() => generateReporteCalibraciones("Reporte Global Calibraciones", calibraciones)} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Exportar Calibraciones</button>
              <button onClick={() => generateReporteBodegas("Reporte Global Bodegas", bodegas)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg">Exportar Bodegas</button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  </div>
);
}



