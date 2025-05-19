/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import {
  Calibracion,
  Herramienta,
  ResponseData,
  Usuario,
} from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";
import FormatedDate from "../../../controllers/utils/formated_date";
import Select from "react-select";

export const RegistroCreate = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [client, setClient] = useState<Usuario[]>([]);
  const [selectedTool, setSelectedTool] = useState(null);

  // Cargar herramientas disponibles
  const loadProducts = async () => {
    setLoading(true);

    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );

    const bodegas = response.data ?? [];
    console.log("bodegas disponibles:", bodegas);
    const bodegasDelUsuario =
      auth.rol === 0
        ? bodegas
        : bodegas.filter(
            (bodega) =>
              bodega.bodegueroAsignado.toLowerCase() ===
              auth.usuario.toLowerCase()
          );

    // Extraemos todas las herramientas de todas las bodegas
    const herramientasDisponibles = bodegasDelUsuario
      .flatMap((bodega) => bodega.herramientas ?? []) // Aseguramos que herramientas exista
      .filter(
        (herramienta) =>
          herramienta.estado === "Disponible" &&
          herramienta.calibracion !== "En calibracion"
      );

    console.log("Herramientas disponibles:", herramientasDisponibles);
    setHerramientas(herramientasDisponibles);

    setLoading(false);
  };

  // Cargar herramientas disponibles
  const loadClient = async () => {
    setLoading(true);

    const response = await HttpClient(
      "/api/user",
      "GET",
      auth.usuario,
      auth.rol
    );

    console.log(response.data);
    const clientesDisponibles = (response.data ?? []).filter(
      (clientes: any) => clientes.rol === 2
    );

    console.log("clientes clientesDisponibles:", clientesDisponibles);
    setClient(clientesDisponibles);

    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
    loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valores iniciales para la solicitud
  const initialValues: Calibracion = {
    number: 0, // Generar un número si es necesario
    herramientas: [],
    fecha: FormatedDate(), // Fecha formateada
    solicitante: auth?.nombre || "",
    estado: "En calibracion",
  };

  // Configuración de Formik
  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      if (values.herramientas.length === 0) {
        toast.warning("Debes agregar al menos una herramienta.");
        return;
      }

      // Si pasa las validaciones, se envía el formulario
      setLoading(true);
      console.log("Valores del formulario:", values);

      const response = await HttpClient(
        "/api/calibracion",
        "POST",
        auth.usuario,
        auth.rol,
        values
      );

      if (response.success) {
        console.log(values.herramientas);

        try {
          // 1. Obtener todas las bodegas para identificar dónde está cada herramienta
          const bodegasResponse = await HttpClient(
            "/api/bodegas",
            "GET",
            auth.usuario,
            auth.rol
          );

          const bodegas = bodegasResponse.data ?? [];

          // 2. Crear un mapa de herramientas a actualizar por bodega
          const actualizacionesPorBodega = {};

          // Agrupar herramientas por bodega
          for (const herramientaSolicitud of values.herramientas) {
            // Buscar la bodega que contiene esta herramienta
            for (const bodega of bodegas) {
              if (!bodega.herramientas) continue;

              const indiceHerramienta = bodega.herramientas.findIndex(
                (h) => h.id === herramientaSolicitud.id
              );

              if (indiceHerramienta !== -1) {
                // Esta herramienta está en esta bodega
                if (!actualizacionesPorBodega[bodega.id]) {
                  // Inicializar la entrada para esta bodega si no existe
                  actualizacionesPorBodega[bodega.id] = {
                    bodega: bodega,
                    herramientasActualizar: [],
                  };
                }

                // Agregar esta herramienta a la lista de actualizaciones
                actualizacionesPorBodega[bodega.id].herramientasActualizar.push(
                  {
                    indice: indiceHerramienta,
                    id: herramientaSolicitud.id,
                  }
                );

                // No es necesario seguir buscando en otras bodegas
                break;
              }
            }
          }

          // 3. Realizar las actualizaciones por bodega
          await Promise.all(
            Object.values(actualizacionesPorBodega).map(
              async (actualizacion) => {
                //@ts-ignore
                const { bodega, herramientasActualizar } = actualizacion;

                // Crear una copia de las herramientas de la bodega
                const herramientasActualizadas = [...bodega.herramientas];

                // Actualizar cada herramienta
                for (const { indice, id } of herramientasActualizar) {
                  herramientasActualizadas[indice] = {
                    ...herramientasActualizadas[indice],
                    calibracion: "En calibracion",
                  };
                }

                // Crear la bodega actualizada
                const bodegaActualizada = {
                  ...bodega,
                  herramientas: herramientasActualizadas,
                };

                // Enviar la actualización al servidor
                return HttpClient(
                  `/api/bodegas/`,
                  "PUT",
                  auth.usuario,
                  auth.rol,
                  bodegaActualizada
                );
              }
            )
          );

          toast.success(
            "Registro creado correctamente y herramientas actualizadas a 'En calibracion'!"
          );
        } catch (error) {
          console.error("Error al actualizar las herramientas:", error);
          toast.warning(
            "Registro creado pero hubo un problema al actualizar las herramientas."
          );
        }

        Router.back();
      } else {
        toast.warning(response.message);
      }

      setLoading(false);
    },
  });

  // Filtrar herramientas ya seleccionadas
  const herramientasDisponibles = herramientas.filter(
    (h) => !formik.values.herramientas.some((selected) => selected.id === h.id)
  );

  // Opciones para el Select con búsqueda
  const toolOptions = herramientasDisponibles.map((tool) => ({
    value: tool.id,
    label: `${tool.nombre} - ${tool.codigo} - ${tool.modelo} - ${tool.marca} - ${tool.ubicacion} - ${tool.serie}`,
  }));

  // Agregar herramienta
  const addHerramienta = () => {
    if (!selectedTool) return;
    const selectedToolData = herramientas.find(
      (tool) => tool.id === selectedTool.value
    );
    if (selectedToolData) {
      formik.setFieldValue("herramientas", [
        ...formik.values.herramientas,
        selectedToolData,
      ]);
      setSelectedTool(null);
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
            Crear registro de herramientas para calibrar
          </h1>
          <form onSubmit={formik.handleSubmit}>
            {/* Datos del cliente */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">
                Solicitante
              </label>
              <input
                type="text"
                name="solicitante"
                onChange={formik.handleChange}
                value={formik.values.solicitante}
                className="border p-2 w-full rounded-lg"
                placeholder="Nombre del solicitante"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">
                Fecha
              </label>
              <input
                type="text"
                name="fecha"
                value={formik.values.fecha}
                disabled
                className="border p-2 w-full bg-gray-200 rounded-lg"
              />
            </div>

            {/* Agregar herramientas */}
            <div className="mb-4">
              <p className="text-xl font-bold text-blue-500 mb-2">
                Agregar Herramientas
              </p>
              <div className="flex items-center gap-2">
                <div className="w-full">
                  <Select
                    value={selectedTool}
                    onChange={setSelectedTool}
                    options={toolOptions}
                    isSearchable
                    placeholder="Buscar herramienta..."
                    className="w-full"
                  />
                </div>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                  type="button"
                  onClick={addHerramienta}
                >
                  Agregar
                </Button>
              </div>
            </div>

            {/* Listado de herramientas agregadas */}
            <div className="mb-4">
              <p className="text-xl font-bold text-blue-500 mb-2">
                Herramientas agregadas
              </p>
              {formik.values.herramientas.length === 0 ? (
                <p className="text-gray-500">No hay herramientas agregadas.</p>
              ) : (
                <ul className="border rounded-lg p-3 bg-gray-50">
                  {formik.values.herramientas.map((tool, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center border-b last:border-b-0 p-2"
                    >
                      <span>
                        {tool.nombre} - {tool.codigo} - ${tool.modelo} - $
                        {tool.marca} - ${tool.ubicacion} - ${tool.serie}
                      </span>
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg"
                        size="sm"
                        onClick={() => {
                          const updatedTools =
                            formik.values.herramientas.filter(
                              (_, i) => i !== index
                            );
                          formik.setFieldValue("herramientas", updatedTools);
                        }}
                      >
                        Eliminar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              {loading ? "Enviando..." : "Enviar Registro"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroCreate;
