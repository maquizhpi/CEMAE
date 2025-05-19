/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useAuth } from "../../controllers/hooks/use_auth";
import HttpClient from "../../controllers/utils/http_client";
import Sidebar from "../components/sidebar";
import { Herramienta } from "../../models";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashboardBodeguero() {
  const { auth } = useAuth();
  const [herramientas, setHerramientas] = useState<Array<Herramienta>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const response = await HttpClient("/api/herramientas", "GET", auth.usuario, auth.rol);
    const herramientasFiltradas = (response.data ?? []).filter(
      (h: Herramienta) => h.bodegueroAsignado === auth.usuario
    );
    setHerramientas(herramientasFiltradas);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const total = herramientas.length;
  const disponibles = herramientas.filter(h => h.estado === "Disponible").length;
  const enUso = herramientas.filter(h => h.estado === "En uso").length;
  const calibradas = herramientas.filter(h => h.calibracion === "Calibrada").length;
  const noCalibradas = herramientas.filter(h => h.calibracion === "No calibrada").length;

  const data = [
    { name: "Disponibles", value: disponibles },
    { name: "En Uso", value: enUso },
    { name: "Calibradas", value: calibradas },
    { name: "No Calibradas", value: noCalibradas }
  ];

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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{total}</p>
                <p className="text-sm">Total Herramientas</p>
              </div>
              <div className="bg-blue-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{disponibles}</p>
                <p className="text-sm">Disponibles</p>
              </div>
              <div className="bg-red-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{enUso}</p>
                <p className="text-sm">En Uso</p>
              </div>
              <div className="bg-yellow-200 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{calibradas}</p>
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
                  <Bar dataKey="value" fill="#0072CC" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
