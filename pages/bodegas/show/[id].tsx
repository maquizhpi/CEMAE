/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef } from "react";
import Router from "next/router";
import { toast } from "react-toastify";
import { useAuth } from "../../../controllers/hooks/use_auth";
import HttpClient from "../../../controllers/utils/http_client";
import { Bodega, ResponseData } from "../../../models";
import Sidebar from "../../components/sidebar";
import {  ExcelExport,  ExcelExportColumn,} from "@progress/kendo-react-excel-export";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InformacionBodega = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bodega, setBodega] = useState<Bodega | null>(null);
  const excelExporter = useRef<any>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const herramientas = bodega?.herramientas ?? [];
  const totalPaginas = Math.ceil(herramientas.length / elementosPorPagina);
  const herramientasPaginadas = herramientas.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);


  useEffect(() => {
    const loadData = async () => {
      if (Router.asPath !== Router.route) {
        setLoading(true);
        const bodegaID = Router.query.id as string;
        const response: ResponseData = await HttpClient(
          `/api/bodegas/${bodegaID}`,
          "GET",
          auth.usuario,
          auth.rol
        );
        if (response.success) {
          setBodega(response.data);
        } else {
          toast.error("Bodega no encontrada.");
        }
        setLoading(false);
      }
    };

    loadData();
  }, [auth]);

    const exportToExcel = () => {
    if (excelExporter.current) {
      excelExporter.current.save();
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Reporte de Herramientas - Bodega: ${bodega?.nombreBodega}`, 14, 10);

    const headers = [
      [
        "Orden",
        "Código",
        "Nombre",
        "N° Parte",
        "Serie",
        "Modelo",
        "Marca",
        "Ubicación",
        "Cantidad",
        "Observación",
        "estado",
        "calibracion",
      ],
    ];

    const data = bodega?.herramientas.map((h) => [
      bodega.herramientas.indexOf(h) + 1,
      h.codigo,
      h.nombre,
      h.NParte,
      h.serie,
      h.modelo,
      h.marca,
      h.ubicacion,
      h.cantidad,
      h.observacion,
      h.estado,
      h.calibracion,
    ]);

    autoTable(doc, {
      head: headers,
      body: data || [],
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("Reporte_Herramientas.pdf");
  };

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-">
        <div className="bg-white rounded-lg shadow p-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
            Información de la Bodega: {bodega?.nombreBodega}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <p>
                <strong>Creador:</strong> {bodega?.creador?.nombre}
              </p>
              <p>
                <strong>Bodeguero Asignado:</strong> {bodega?.bodegueroAsignado.nombre}
              </p>
              <p>
                <strong>Fecha de Creación:</strong> {bodega?.fechaDeCreacion}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Herramientas
          </h2>

          <div className="overflow-auto mb-6">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-blue-200 text-gray-700 uppercase">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Código</th>
                  <th className="p-2 border">N° Parte</th>
                  <th className="p-2 border">Nombre</th>
                  <th className="p-2 border">Serie</th>
                  <th className="p-2 border">Marca</th>                
                  <th className="p-2 border">Modelo</th>
                  <th className="p-2 border">Ubicación</th>
                  <th className="p-2 border">Estado</th>
                  <th className="p-2 border">Calibracion</th>
                  <th className="p-2 border">Imagen</th>
                </tr>
              </thead>
              <tbody>
                {herramientasPaginadas.map((h, i) => (
                  <tr key={i} className="text-sm text-center uppercase">
                    <th className="p-2 border">{(paginaActual - 1) * elementosPorPagina + i + 1}</th>
                    <td className="p-2 border">{h.codigo}</td>
                    <td className="p-2 border">{h.NParte}</td>
                    <td className="p-2 border">{h.nombre}</td>
                    <td className="p-2 border">{h.serie}</td>
                    <td className="p-2 border">{h.marca}</td>
                    <td className="p-2 border">{h.modelo}</td>
                    <td className="p-2 border">{h.ubicacion}</td>
                    <td className="p-2 border">{h.estado}</td>
                    <td className="p-2 border">{h.calibracion}</td>
                    <td className="p-2 border">
                      <a href={h.imagen} target="_blank" rel="noopener noreferrer">Ver archivo</a>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => setPaginaActual(i + 1)}
                className={`px-3 py-1 rounded border ${
                  paginaActual === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>


          <div className="flex gap-4 justify-end">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Exportar a Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Exportar a PDF
            </button>
                        <button
              onClick={() => {
                Router.push("/bodegas");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cancelar
            </button>
          </div>

          {/* Exportador Excel oculto */}
          <ExcelExport
            data={bodega?.herramientas || []}
            ref={excelExporter}
            fileName="Inventario_Herramientas.xlsx"
          >
            <ExcelExportColumn field="codigo" title="Código" />
            <ExcelExportColumn field="estado" title="Estado" />
            <ExcelExportColumn field="nombre" title="Nombre" />
            <ExcelExportColumn field="NParte" title="N° Parte" />
            <ExcelExportColumn field="serie" title="Serie" />
            <ExcelExportColumn field="modelo" title="Modelo" />
            <ExcelExportColumn field="marca" title="Marca" />
            <ExcelExportColumn field="ubicacion" title="Ubicación" />
            <ExcelExportColumn field="cantidad" title="Cantidad" />
            <ExcelExportColumn field="observacion" title="Observación" />
          </ExcelExport>
        </div>
      </div>
    </div>
  );
};

export default InformacionBodega;
