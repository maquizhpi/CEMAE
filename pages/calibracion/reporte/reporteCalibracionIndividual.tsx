/* eslint-disable react/no-unescaped-entities */
import Router from "next/router";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../controllers/hooks/use_auth";
import HttpClient from "../../../controllers/utils/http_client";
import { ResponseData, Calibracion } from "../../../models";
import Sidebar from "../../components/sidebar";
import { useReactToPrint } from "react-to-print";
import { Button } from "react-bootstrap";
import Image from "next/image";

const ReporteCalibracionIndividual = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [registro, setRegistro] = useState<Calibracion | null>(null);
  const printRef = useRef(null);

  const loadData = async () => {
    if (Router.asPath !== Router.route) {
      setLoading(true);
      const registroId = Router.query.id as string;

      const response: ResponseData = await HttpClient(
        `/api/calibracion/${registroId}`,
        "GET",
        auth.usuario,
        auth.rol
      );

      if (response.success) {
        setRegistro(response.data);
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
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Reporte_Calibracion_${registro?._id ?? "sin_id"}`,
  });

  const herramienta = registro?.herramientas?.[0];
  const documento = registro?.documentoCalibracion?.trim() ? "Sí" : "No";

  return (
    <>
      <div className="flex h-screen">
        <div className="md:w-1/6 max-w-none print:hidden">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 bg-gray-100 p-4">
          <div className="bg-white w-11/12 mx-auto p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-blue-500">
              Reporte Individual de Calibración
            </h1>

            {/* Sección imprimible */}
            <div ref={printRef} className="print-area p-4 border mt-4">
              <Image src="/image/logo2.jpeg" alt="Logo" width={100} height={100} />
              <div className="text-center">
                <p className="font-bold text-lg">BRIGADA DE AVIACIÓN DEL EJÉRCITO BAE 15 "PAQUISHA"</p>
                <p className="text-sm">ESCUDARÓN DE ASALTO SUPER PUMA</p>
                <p className="text-sm font-bold">BODEGA DE HERRAMIENTAS</p>
                <p className="text-sm font-bold text-red-500">REPORTE INDIVIDUAL DE CALIBRACIÓN</p>
              </div>

              <table className="w-full border mt-4 text-sm">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border p-2">Campo</th>
                    <th className="border p-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-2">Nombre de herramienta</td><td className="border p-2">{herramienta?.nombre ?? "N/A"}</td></tr>
                  <tr><td className="border p-2">Número de serie</td><td className="border p-2">{herramienta?.serie ?? "N/A"}</td></tr>
                  <tr><td className="border p-2">Marca</td><td className="border p-2">{herramienta?.marca ?? "N/A"}</td></tr>
                  <tr><td className="border p-2">Fecha de Calibración</td><td className="border p-2">{registro?.fechaCalibracion ?? "N/A"}</td></tr>
                  <tr><td className="border p-2">Fecha próxima Calibración</td><td className="border p-2">{registro?.fechaProximaCalibracion ?? "N/A"}</td></tr>
                  <tr><td className="border p-2">Empresa de Calibración</td><td className="border p-2">{registro?.empresaDeCalibracion ?? "N/A"}</td></tr>
                  <tr><td className="border p-2">Documento de Calibración</td><td className="border p-2">{documento}</td></tr>
                  <tr><td className="border p-2">Estado</td><td className="border p-2">{registro?.estado?.toUpperCase() ?? "N/A"}</td></tr>
                </tbody>
              </table>

              {/* Firmas */}
              <div className="mt-6 text-sm text-center">
                <p className="font-bold">Encargado de la Bodega</p>
                <div className="mt-12 border-t w-3/4 mx-auto"></div>
                <p className="mt-1">Nombre: __________________________</p>
                <p>Cédula: __________________</p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-center space-x-4 text-center mt-6 print:hidden">
              <button
                onClick={handlePrint}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Exportar PDF
              </button>
              <Button
                as="button"
                type="button"
                onClick={() => Router.push("/calibracion")}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReporteCalibracionIndividual;
