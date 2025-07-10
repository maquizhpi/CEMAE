import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import HttpClient from "../../../controllers/utils/http_client";
import { Bodega, Herramienta, ResponseData } from "../../../models";
import { toast } from "react-toastify";

const VerBodega = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [bodega, setBodega] = useState<Bodega | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBodega = async () => {
    if (!id) return;
    setLoading(true);
    const response: ResponseData = await HttpClient(
      `/api/bodegas/${id}`,
      "GET",
      auth.usuario,
      auth.rol
    );

    if (response.success) {
      setBodega(response.data);
    } else {
      toast.error("No se pudo cargar la bodega");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBodega();
  }, [id]);

  return (
    <div className="flex h-screen">
      <div className="w-1/6">
        <Sidebar />
      </div>
      <div className="w-5/6 p-6 bg-blue-100 overflow-auto">
        <div className="bg-white p-6  rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
            Información de la Bodega
          </h2>

          {loading ? (
            <p className="text-center">Cargando...</p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <p><strong>Número:</strong> {bodega?.number}</p>
                <p><strong>Nombre:</strong> {bodega?.nombreBodega}</p>
                <p><strong>Fecha de creación:</strong> {bodega?.fechaDeCreacion}</p>
                <p><strong>Bodeguero Asignado:</strong> {bodega?.bodegueroAsignado?.nombre} - {bodega?.bodegueroAsignado?.correo}</p>
                <p><strong>Creador:</strong> {bodega?.creador?.nombre} - {bodega?.creador?.correo}</p>
              </div>

              <hr className="mb-4" />

              <h3 className="text-xl font-semibold mb-2 text-gray-500">Herramientas Registradas</h3>
              <div className="overflow-auto max-h-[600px] border border-gray-200 rounded">
                <table className="min-w-full text-sm text-center bg-white uppercase">
                  <thead className="bg-blue-200">
                    <tr>
                      <th className="px-2 py-1 border">#</th>
                      <th className="px-2 py-1 border">Código</th>
                      <th className="px-2 py-1 border">Nombre</th>
                      <th className="px-2 py-1 border">Serie</th>
                      <th className="px-2 py-1 border">Modelo</th>
                      <th className="px-2 py-1 border">Ubicación</th>
                      <th className="px-2 py-1 border">N_Parte</th>
                      <th className="px-2 py-1 border">Marca</th>
                      <th className="px-2 py-1 border">Tipo</th>
                      <th className="px-2 py-1 border">Estado</th>
                      <th className="px-2 py-1 border">Observaciones</th>
                      <th className="px-2 py-1 border">Imagen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bodega?.herramientas?.map((h: Herramienta, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1">{i + 1}</td>
                        <td className="px-2 py-1">{h.codigo}</td>
                        <td className="px-2 py-1">{h.nombre}</td>
                        <td className="px-2 py-1">{h.serie}</td>
                        <td className="px-2 py-1">{h.modelo}</td>
                        <td className="px-2 py-1">{h.ubicacion}</td>
                        <td className="px-2 py-1">{h.NParte}</td>
                        <td className="px-2 py-1">{h.marca}</td>
                        <td className="px-2 py-1">{h.tipo}</td>
                        <td className="px-2 py-1">{h.estado}</td>
                        <td className="px-2 py-1">{h.observacion}</td>
                        <td className="px-2 py-1">
                          {h.imagen ? (
                            <img
                              src={h.imagen}
                              alt={h.nombre}
                              className="w-12 h-12 object-contain border rounded"
                            />
                          ) : (
                            <span>No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerBodega;