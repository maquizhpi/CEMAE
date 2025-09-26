/* eslint-disable react/no-unescaped-entities */
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Herramienta } from "../../models";
import { useAuth } from "../../controllers/hooks/use_auth";
import HttpClient from "../../controllers/utils/http_client";
import Sidebar from "../components/sidebar";
import CatalogoHerramientaModal from "../components/modals/catalogoHerramientaModal";

const CatalogoHerramientas = () => {
  const { auth } = useAuth();
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [herramientaSeleccionada, setHerramientaSeleccionada] = useState<Herramienta | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const loadHerramientas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await HttpClient("/api/bodegas", "GET", auth?.usuario, auth?.rol);
      const bodegas = response?.data ?? [];
      const todasHerramientas: Herramienta[] = bodegas.flatMap((b: any) =>
        (b.herramientas || []).map((h: Herramienta) => ({
          ...h,
          // agrega el nombre de la bodega a cada herramienta
          nombreBodega: b.nombreBodega,
        }))
      );
      setHerramientas(todasHerramientas);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar el catálogo.");
      setHerramientas([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.usuario, auth?.rol]);

  useEffect(() => {
    void loadHerramientas();
  }, [loadHerramientas]);

  const abrirModal = (herramienta: Herramienta) => {
    setHerramientaSeleccionada(herramienta);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setHerramientaSeleccionada(null);
  };

  const herramientasFiltradas = useMemo(() => {
    const q = (busqueda ?? "").toLowerCase().trim();
    const list = herramientas.filter((h) => {
      const nombre = (h?.nombre ?? "").toLowerCase();
      const modelo = (h?.modelo ?? "").toLowerCase();
      return nombre.includes(q) || modelo.includes(q);
    });
    return list.sort((a, b) => (a?.nombre ?? "").localeCompare(b?.nombre ?? ""));
  }, [herramientas, busqueda]);

  return (
    <div className="flex h-screen">
      {/* Sidebar izquierdo */}
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-6 overflow-y-auto h-screen">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Catálogo de Herramientas
        </h1>

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

        {/* Estados de carga y error */}
        {loading && (
          <p className="text-center text-sm text-gray-600 mb-4">Cargando herramientas…</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-600 mb-4">
            {error}
          </p>
        )}

        {/* Tarjetas de herramientas */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {herramientasFiltradas.map((h, idx) => {
              const key =
                (h as any)?.id ||
                (h as any)?._id ||
                `${h?.nombre ?? "herr"}-${h?.modelo ?? "mod"}-${idx}`;

              const src = h?.imagen || "/image/no-image.png";

              return (
                <div
                  key={key}
                  className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition duration-300"
                  onClick={() => abrirModal(h)}
                >
                  <div className="relative w-full h-40 mb-2">
                    <Image
                      src={src}
                      alt={h?.nombre ? `Imagen de ${h.nombre}` : "Imagen"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover rounded-md"
                      priority={idx < 8} // precarga primeras
                    />
                  </div>
                  <h3 className="text-lg font-semibold uppercase text-blue-600">
                    {h?.nombre ?? "Sin nombre"}
                  </h3>
                  <p className="text-sm text-gray-600">Modelo: {h?.modelo ?? "-"}</p>
                  <p className="text-sm text-gray-600">Estado: {h?.estado ?? "-"}</p>
                  <p className="text-sm text-gray-600">Bodega: {(h as any).nombreBodega ?? "-"}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && herramientasFiltradas.length === 0 && (
          <p className="text-center text-sm text-gray-600">No hay herramientas para mostrar.</p>
        )}

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
