/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useAuth } from "../../controllers/hooks/use_auth";
import Sidebar from "../components/sidebar";
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, Cell } from "recharts";

export default function DashboardCliente() {
  const { auth } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);

  const loadData = async () => {
    try {
      const responseSol = await fetch("/api/solicitudes");
      const dataSol = await responseSol.json();

      const misSolicitudes = (dataSol.data ?? []).filter(s =>
        s.receptor?.nombre?.toLowerCase().trim() === auth.nombre?.toLowerCase().trim()

      );
      setSolicitudes(misSolicitudes);

    } catch (error) {
      console.error("Error al cargar datos desde la base de datos:", error);
    }
  };
 //// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  }, []);

  const totalSolicitudes = solicitudes.length;
  const entregadas = solicitudes.filter(s => s.estado === "Herramientas entregadas").length;
  const noEntregadas = solicitudes.filter(s => s.estado !== "Herramientas entregadas").length;

  const data = [
    { name: "Total Solicitudes", value: totalSolicitudes },
    { name: "Solicitudes Entregadas", value: entregadas },
    { name: "Solicitudes No Entregadas", value: noEntregadas }
  ];

  const colors = ["#FDE68A", "#D1FAE5", "#FECACA"];

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 overflow-y-scroll">
        <div className="flex-1 p-6">
          <div className="bg-white w-full rounded-xl shadow-2xl p-8 mb-8">
            <h2 className="text-3xl text-center text-blue-800 font-bold mb-6">
              Dashboard del Cliente
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{totalSolicitudes}</p>
                <p className="text-sm">Total Solicitudes Realizadas</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{entregadas}</p>
                <p className="text-sm">Solicitudes Entregadas</p>
              </div>
             <div className="bg-red-100 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{noEntregadas}</p>
                <p className="text-sm">Solicitudes No Entregadas</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-center text-xl font-bold mb-4 text-blue-800">Estado de Solicitudes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
