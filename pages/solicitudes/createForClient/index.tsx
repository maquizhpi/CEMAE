/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import {
  Herramienta,
  Solicitude,
  ResponseData,
  Usuario,
  Bodega,
} from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";
import FormatedDate from "../../../controllers/utils/formated_date";
import Select from "react-select";

export const RegistroCreateForClient = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [client, setClient] = useState<Usuario[]>([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [allBodegas, setAllBodegas] = useState<Bodega[]>([]);

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

    setAllBodegas(bodegas); // guarda todas las bodegas para filtrarlas luego
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

    const clientesDisponibles = (response.data ?? []).filter(
      (clientes: any) => clientes.rol === 1
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
  const initialValues: Solicitude = {
    number: 0, // Generar un número si es necesario
    herramientas: [],
    fecha: FormatedDate(), // Fecha formateada
    solicitante: "",
    receptor: auth?.nombre,
    estado: "No entregado",
  };

  // Configuración de Formik
  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      // Validaciones manuales antes de enviar
      if (!values.receptor.trim()) {
        toast.warning("El campo 'Receptor' es obligatorio.");
        return;
      }

      if (values.herramientas.length === 0) {
        toast.warning("Debes agregar al menos una herramienta.");
        return;
      }

      // Si pasa las validaciones, se envía el formulario
      setLoading(true);
      console.log("Valores del formulario:", values);

      const response = await HttpClient(
        "/api/solicitudes",
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
                    estado: "En uso",
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
            "Registro creado correctamente y herramientas actualizadas a 'En uso'!"
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

    useEffect(() => {
    if (!formik.values.solicitante) {
      setHerramientas([]);
      return;
    }

    const bodegasDelBodeguero = allBodegas.filter(
      (bodega) =>
        bodega.bodegueroAsignado.toLowerCase() ===
        formik.values.solicitante.toLowerCase()
    );

    const herramientasDisponibles = bodegasDelBodeguero
      .flatMap((bodega) => bodega.herramientas ?? [])
      .filter((herramienta) => herramienta.estado === "Disponible");

    setHerramientas(herramientasDisponibles);
  }, [formik.values.solicitante, allBodegas]);

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
            Crear registro de herramientas prestadas
          </h1>
          <form onSubmit={formik.handleSubmit}>
            {/* Datos del cliente */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">
                Solicitante
              </label>
              <select
                name="solicitante"
                value={formik.values.solicitante}
                onChange={formik.handleChange}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
              >
                <option value="">Seleccione un bodeguero</option>
                {client.map((ubic) => (
                  <option key={ubic.id} value={ubic.nombre}>
                    {ubic.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">
                Receptor
              </label>
              <input
                type="text"
                name="receptor"
                onChange={formik.handleChange}
                value={formik.values.receptor}
                className="border p-2 w-full rounded-lg"
                placeholder="Nombre del receptor"
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
                  {herramientasDisponibles.length === 0 &&
                    formik.values.solicitante && (
                      <p className="text-red-500 text-sm mt-2">
                        No hay herramientas disponibles para este bodeguero.
                      </p>
                    )}
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

export default RegistroCreateForClient;
