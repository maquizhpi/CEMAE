/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {  Bodega,  Herramienta,} from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import * as XLSX from "xlsx";
import DescargarFormatoExcel from "../../components/DescargarFormatoExcel";
import Router from "next/router";

// Componente para importar herramientas desde un archivo Excel


export default function ImportarHerramientas() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);

  const loadBodegas = async () => {
    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );
    setBodegas(response.data ?? []);
  };

  useEffect(() => {
    loadBodegas();
  }, []);

  // Maneja la carga del archivo Excel
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      for (const row of jsonData) {
        const herramienta: Partial<Herramienta> = {
          nombre: row["Nombre"] ?? "",
          codigo: row["Código"] ?? "",
          descripcion: row["Descripción"] ?? "",
          serie: row["Serie"] ?? "",
          modelo: row["Modelo"] ?? "",
          marca: row["Marca"] ?? "",
          NParte: row["N°Parte"] ?? "",
          ubicacion: row["Ubicación"] ?? "",
          estado: row["Estado"] ?? "",
          calibracion: row["Calibración"] ?? "",
          tipo: row["Tipo"] ?? "",
          cantidad: 1,
          observacion: row["Observación"] ?? "",
          imagen: "", 
        };

        const bodegaNombre = row["Bodega"]?.trim();

        // Buscar bodega
        const bodega = bodegas.find(
          (b) =>
            b.nombreBodega.trim().toLowerCase() ===
            bodegaNombre.toLowerCase()
        );

        if (!bodega) {
          toast.warning(`No se encontró la bodega: ${bodegaNombre}`);
          continue;
        }

        // Ver si ya existe la herramienta por código
        const herramientas = bodega.herramientas ?? [];
        const index = herramientas.findIndex(
          (h) => h.codigo === herramienta.codigo
        );

        if (index >= 0) {
          // Actualizar
          herramientas[index] = {
            ...herramientas[index],
            ...herramienta,
          };
        } else {
          // Insertar nueva
          herramientas.push({
            ...herramienta,
            nombre: herramienta.nombre ?? "", 
            codigo: herramienta.codigo ?? "",
            descripcion: herramienta.descripcion ?? "",
            serie: herramienta.serie ?? "",
            modelo: herramienta.modelo ?? "",
            marca: herramienta.marca ?? "",
            NParte: herramienta.NParte ?? "",
            ubicacion: herramienta.ubicacion ?? "",
            estado: herramienta.estado ?? "",
            calibracion: herramienta.calibracion ?? "",
            tipo: herramienta.tipo ?? "",
            cantidad: herramienta.cantidad ?? 1,
            observacion: herramienta.observacion ?? "",
            imagen: herramienta.imagen ?? "",
            _id: undefined,
          } as Herramienta);
        }

        const bodegaActualizada = {
          ...bodega,
          herramientas,
        };

        // PUT
        const response = await HttpClient(
          "/api/bodegas",
          "PUT",
          auth.usuario,
          auth.rol,
          bodegaActualizada
        );

        if (response.success) {
          toast.success(
            `Actualizada bodega: ${bodega.nombreBodega} con herramienta: ${herramienta.nombre}`
          );
        } else {
          toast.error(
            `Error actualizando bodega: ${bodega.nombreBodega}`
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error procesando el archivo.");
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
            Importar herramientas desde Excel
          </h1>

          <div className="flex flex-col space-y-4 items-center">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFile}
              disabled={loading}
              className="p-2 border rounded w-full"
            />
          <div className="flex space-x-4">
            <Button
              as="button"
              type="button"
              onClick={() => {
                Router.push("/herramientas"); // o la ruta que corresponda en tu app
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg mt-4"
            >
              Cancelar
            </Button>
            <Button
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg mt-4"
            >
              {loading ? "Procesando..." : "Subir archivo"}
            </Button>
            <DescargarFormatoExcel />
          </div>
            <p className="text-gray-500 text-center mt-4">
              Formato esperado: Nombre, Código, Descripción, Serie, Modelo, Marca, N°Parte,
              Ubicación, Estado, Calibración, Tipo, Observación, Bodega
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


