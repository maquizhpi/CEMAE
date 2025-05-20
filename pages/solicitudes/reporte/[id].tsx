/* eslint-disable react/no-unescaped-entities */
import Router from "next/router";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../controllers/hooks/use_auth";
import HttpClient from "../../../controllers/utils/http_client";
import { ResponseData, Solicitude, Herramienta } from "../../../models";
import Sidebar from "../../components/sidebar";
import { useReactToPrint } from "react-to-print";

const ReporteRegistro = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [registro, setRegistro] = useState<Solicitude | null>(null);
  const [herramientasDetalles, setHerramientasDetalles] = useState<Herramienta[]>([]);
  const printRef = useRef(null);

  const loadData = async () => {
    if (Router.asPath !== Router.route) {
      setLoading(true);
      const registroId = Router.query.id as string;

      const response: ResponseData = await HttpClient(
        `/api/solicitudes/${registroId}`,
        "GET",
        auth.usuario,
        auth.rol
      );

      if (response.success) {
        const solicitud = response.data;
        setRegistro(solicitud);

        //Usa directamente los datos que ya están embebidos
        setHerramientasDetalles(solicitud.herramientas || []);
      } else {
        toast.error("Registro no encontrado.");
      }
      setLoading(false);
    } else {
      setTimeout(loadData, 1000);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Reporte_${registro?.id}`,
  });

  return (
    <>
      <div className="flex h-screen">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 bg-gray-100 p-4">
          <div className="bg-white w-11/12 mx-auto p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-blue-500">
              Recibo de Entrega de Herramientas
            </h1>

            <div ref={printRef} className="p-4 border mt-4">
              {/* Encabezado */}
              <div className="text-center">
                <p className="font-bold text-lg">
                  BRIGADA DE AVIACIÓN DEL EJÉRCITO BAE 15 "PAQUISHA"
                </p>
                <p className="text-sm">ESCUDARÓN DE ASALTO SUPER PUMA</p>
                <p className="text-sm font-bold">BODEGA DE HERRAMIENTAS</p>
                <p className="text-sm font-bold text-red-500">No. {registro?.number ?? "___"}</p>
              </div>

              {/* Información del solicitante y receptor */}
              <div className="mt-4 border-b pb-2">
                <p><strong>Solicitante:</strong> {registro?.solicitante ?? "________"}</p>
                <p><strong>Receptor:</strong> {registro?.receptor ?? "________"}</p>
                <p><strong>Fecha:</strong> {registro?.fecha ?? "________"}</p>
                <p><strong>Observacion:</strong> {registro?.observacion ?? "________"}</p>
              </div>

              {/* Tabla de herramientas */}
              <table className="w-full border mt-4">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th className="border p-2">Descripción</th>
                    <th className="border p-2">Marca</th>
                    <th className="border p-2">Serie</th>
                    <th className="border p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {herramientasDetalles.length ? (
                    herramientasDetalles.map((herramienta, index) => (
                      <tr key={index} className="text-center">
                        <td className="border p-2">{herramienta.nombre ?? herramienta.descripcion}</td>
                        <td className="border p-2">{herramienta.marca ?? "Sin marca"}</td>
                        <td className="border p-2">{herramienta.serie ?? "N/A"}</td>
                        <td className="border p-2">
                          {registro?.estado?.toLowerCase() === "herramientas entregadas" ? (
                            <span className="text-green-700 font-semibold">Entregado</span>
                          ) : (
                            <span className="text-red-600 italic">Pendiente</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="border p-2 text-center text-gray-500">
                        No hay herramientas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>


              {/* Firmas */}
              <div className="mt-6 flex justify-between text-sm">
                <div className="text-center w-1/2">
                  <p>Encargado de la Bodega</p>
                  <p className="mt-12 border-t w-3/4 mx-auto">Firma</p>
                  <p>Nombre:</p>
                  <p>Cédula:</p>
                </div>
                <div className="text-center w-1/2">
                  <p>Recibí Conforme</p>
                  <p className="mt-12 border-t w-3/4 mx-auto">Firma</p>
                  <p>Nombre:</p>
                  <p>Cédula:</p>
                </div>
              </div>
            </div>

            {/* Botón de impresión */}
            <div className="text-center mt-6">
              <button
                onClick={handlePrint}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Imprimir Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReporteRegistro;
