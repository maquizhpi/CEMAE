/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useState } from "react";
import * as XLSX from "xlsx";
import Router from "next/router";
import { useAuth } from "../../../../../controllers/hooks/use_auth";
import HttpClient from "../../../../../controllers/utils/http_client";
import Sidebar from "../../../../components/sidebar";

export default function ImportarUsuarios() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null); // ← archivo seleccionado

  // SOLO guarda el archivo seleccionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  // AQUÍ se procesa todo al dar clic en “Subir archivo”
  const handleUpload = async () => {
    if (!file) {
      toast.warning("Seleccione un archivo Excel antes de subir");
      return;
    }

    setLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (!rows.length) {
        toast.warning("El archivo Excel está vacío");
        return;
      }

      for (const row of rows) {
        const usuario = (row["Usuario"] ?? "").toString().trim();
        const contraseña = (row["Contraseña"] ?? "").toString().trim();

        if (!usuario || !contraseña) {
          toast.warning("Fila sin Usuario o Contraseña, se omite.");
          continue;
        }

        const nuevoUsuario = {
          nombre: (row["Nombre"] ?? "").toString().trim(),
          identificacion:
            (row["Identificación"] ?? row["Cedula"] ?? "").toString().trim(),
          usuario,
          contraseña, // el hash lo haces en el backend
          correo: (row["Correo"] ?? "").toString().trim(),
          telefono: (row["Teléfono"] ?? "").toString().trim(),
          estado: (row["Estado"] ?? "Activo").toString().trim(),
          rol: 2, // Cliente
        };

        const response = await HttpClient(
          "/api/user",
          "POST",
          auth.usuario,
          auth.rol,
          nuevoUsuario
        );

        if (response.success) {
          toast.success(`Usuario creado: ${usuario}`);
        } else {
          toast.error(
            `Error creando usuario: ${usuario} - ${
              response.message || "Error al crear usuario"
            }`
          );
        }
      }

      // ✅ AQUÍ: ya terminó TODO el proceso
      toast.success("Importación de usuarios finalizada");
      Router.push("/configuration");   // vuelve automáticamente a la lista

    } catch (error) {
      console.error(error);
      toast.error("Error procesando el archivo.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
            Importar usuarios desde Excel
          </h1>

          <div className="flex flex-col space-y-4 items-center">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}   // ← ahora solo guarda el archivo
              disabled={loading}
              className="p-2 border rounded w-full"
            />

            <div className="flex space-x-4">
              <Button
                as="button"
                type="button"
                onClick={() => Router.push("/usuarios")}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg mt-4"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleUpload}       // ← AQUÍ empieza la carga
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg mt-4"
              >
                {loading ? "Procesando..." : "Subir archivo"}
              </Button>
            </div>

            <p className="text-gray-500 text-center mt-4">
              Formato esperado de columnas en Excel:{" "}
              <b>
                Nombre, Identificación, Usuario, Contraseña, Correo, Teléfono,
                Estado, Rol
              </b>
              .<br />
              El hash de las contraseñas se realiza en el servidor al guardar el
              usuario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
