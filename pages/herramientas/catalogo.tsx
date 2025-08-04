/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useCallback } from "react";
import { Herramienta } from "../../models";
import { useAuth } from "../../controllers/hooks/use_auth";
import HttpClient from "../../controllers/utils/http_client";
import Sidebar from "../components/sidebar";
import CatalogoHerramientaModal from "../components/modals/catalogoHerramientaModal";
import Image from "next/image";

const CatalogoHerramientas = () => {
  const { auth } = useAuth();
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState<Herramienta | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // 👇 Se usa useCallback para evitar warning de dependencia
  const loadHerramientas = useCallback(async () => {
    const response = await HttpClient("/api/bodegas", "GET", auth.usuario, auth.rol);
    const bodegas = response.data ?? [];
    const todasHerramientas: Herramienta[] = bodegas.flatMap((b) =>
      (b.herramientas || []).map((h: Herramienta) => ({
        ...h,
        nombreBodega: b.nombreBodega,
      }))
    );
    setHerramientas(todasHerramientas);
  }, [auth]);

  useEffect(() => {
    loadHerramientas();
  }, [loadHerramientas]);

  const abrirModal = (herramienta: Herramienta) => {
    setHerramientaSeleccionada(herramienta);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setHerramientaSeleccionada(null);
  };

  const herramientasFiltradas = herramientas.filter((h) =>
    h.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    h.modelo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar izquierdo */}
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-6 overflow-y-auto h-screen">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Catálogo de Herramientas</h1>

        {/* Panel de búsqueda */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Buscar por nombre o modelo..."
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tarjetas de herramientas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {herramientasFiltradas
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((h) => (
              <div
                key={h.id}
                className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition duration-300"
                onClick={() => abrirModal(h)}
              >
                <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden">
                  <Image
                    src={h.imagen || "/image/no-image.png"}
                    alt={`Imagen perteneciente a una herramienta especial guardada en la base de datos la cual corresponde a ${h.nombre}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <h3 className="text-lg font-semibold uppercase text-blue-600">{h.nombre}</h3>
                <p className="text-sm text-gray-600">Modelo: {h.modelo}</p>
                <p className="text-sm text-gray-600">Estado: {h.estado}</p>
                <p className="text-sm text-gray-600">Bodega: {h.nombreBodega}</p>
              </div>
            ))}
        </div>

        {/* Modal de detalle */}
        <CatalogoHerramientaModal
          visible={showModal}
          close={cerrarModal}
          herramienta={herramientaSeleccionada}
        />
      </div>
    </div>
  );
};

export default CatalogoHerramientas;
