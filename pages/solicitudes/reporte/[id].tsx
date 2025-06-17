/* eslint-disable react/no-unescaped-entities */
import Router from "next/router";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../controllers/hooks/use_auth";
import HttpClient from "../../../controllers/utils/http_client";
import { ResponseData, Solicitude, Herramienta, Usuario, Bodega } from "../../../models";
import Sidebar from "../../components/sidebar";
import { useReactToPrint } from "react-to-print";

// Componente principal para mostrar el reporte de una solicitud
const ReporteRegistro = () => {
  // Hook de autenticación
  const { auth } = useAuth();

  // Estados para manejar la información del reporte
  const [loading, setLoading] = useState<boolean>(false);
  const [registro, setRegistro] = useState<Solicitude | null>(null);
  const [herramientasDetalles, setHerramientasDetalles] = useState<Herramienta[]>([]);
  const [bodeguero, setBodeguero] = useState<Solicitude | null>(null);
  const [receptor, setReceptor] = useState<Solicitude | null>(null);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const printRef = useRef(null); // Referencia para imprimir el reporte

  // Función para cargar los datos de la solicitud y bodegas
  const loadData = async () => {
    // Verifica que la ruta esté lista
    if (Router.asPath !== Router.route) {
      setLoading(true);
      const registroId = Router.query.id as string;

      // Solicita los datos de la solicitud
      const response: ResponseData = await HttpClient(
        `/api/solicitudes/${registroId}`,
        "GET",
        auth.usuario,
        auth.rol
      );

      // Solicita los datos de las bodegas
      const bodegasResponse = await HttpClient(
        "/api/bodegas",
        "GET", 
        auth.usuario, 
        auth.rol);

      if (response.success) {
        const solicitud = response.data;
        setRegistro(solicitud);
        setHerramientasDetalles(solicitud.herramientas || []);
        setBodeguero(solicitud.bodeguero);
        setReceptor(solicitud.receptor);
        setBodegas(bodegasResponse.data ?? []);
      } else {
        toast.error("Registro no encontrado.");
      }
      setLoading(false);
    } else {
      // Si la ruta aún no está lista, reintenta después de 1 segundo
      setTimeout(loadData, 1000);
    }
  };

  // Carga los datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Hook para imprimir el reporte
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Reporte_${registro?._id ?? "sin_id"}`,
  });

  // Verifica el estado actual de una herramienta en las bodegas
  const verificarEstadoHerramienta = (herramienta: Herramienta) => {
    for (const bodega of bodegas) {
      const encontrada = bodega.herramientas?.find(
        h => h.nombre === herramienta.nombre && h.codigo === herramienta.codigo
      );
      if (encontrada) return encontrada.estado;
    }
    return "Desconocido";
  };

  return (
    <>
      <div className="flex h-screen">
        {/* Barra lateral */}
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        {/* Contenido principal */}
        <div className="w-12/12 md:w-5/6 bg-gray-100 p-4">
          <div className="bg-white w-11/12 mx-auto p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-blue-500">
              Recibo de Entrega de Herramientas
            </h1>

            {/* Sección imprimible */}
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

              {/* Datos del bodeguero */}
              <div className="mt-4 border-b pb-2">
                <p><strong>Bodeguero:</strong> {bodeguero?.nombre ?? "________"} </p>
              </div>
              {/* Datos del receptor */}
              <div className="mt-4 border-b pb-2">
                <p><strong>Receptor:</strong> {receptor?.nombre ?? "________"}</p>
              </div>
              {/* Fecha */}
              <div className="mt-4 border-b pb-2">
                <p><strong>Fecha:</strong> {registro?.fecha ?? "________"}</p> 
              </div>
              {/* Observación */}
              <div className="mt-4 border-b pb-2">
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
                    herramientasDetalles.map((herramienta, index) => {
                      const estadoActual = verificarEstadoHerramienta(herramienta);
                      return (
                        <tr key={index} className="text-center uppercase">
                          <td className="border p-2">{herramienta.nombre ?? "Sin herramientas"}</td>
                          <td className="border p-2">{herramienta.marca ?? "Sin marca"}</td>
                          <td className="border p-2">{herramienta.serie ?? "N/A"}</td>
                          <td className="border p-2">
                            {estadoActual === "Disponible" ? (
                              <span className="text-green-700 font-semibold">Entregado</span>
                            ) : (
                              <span className="text-red-600 italic">Pendiente</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
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
              <div className="mt-4 border-b pb-2">
              <table className="w-full border mt-4"></table>
              
              <div className="mt-6 flex justify-between text-sm">
               <div className="text-center w-1/2">
                  <p>Encargado de la Bodega</p>
                  <p className="mt-12 border-t w-3/4 mx-auto">Firma</p>
                  <p>Nombre: {bodeguero?.nombre ?? auth?.nombre ?? "________"}</p>
                  <p>Cédula: {bodeguero?.identificacion ?? auth?.identificacion ?? "________"}</p>
                </div>
                <div className="text-center w-1/2">
                  <p>Recibí Conforme</p>
                  <p className="mt-12 border-t w-3/4 mx-auto">Firma</p>
                  <p>Nombre: {receptor?.nombre ?? "________"}</p>
                  <p>Cédula: {receptor?.identificacion ?? "________"}</p>
                </div>
              </div> 
              </div>

            </div>

            {/* Botón para imprimir */}
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