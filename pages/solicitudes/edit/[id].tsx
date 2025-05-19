/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import { Solicitude, ResponseData } from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";
import FormatedDate from "../../../controllers/utils/formated_date";
import Select from "react-select";

export const EditarRegistro = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [solicitudes, setsolicitudes] = useState<Solicitude[]>([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [initialValues, setInitialValues] = useState<Solicitude | null>(null);

  const loadData = async () => {
    setLoading(true);
    const solicitudeId = Router.query.id as string;
    const response = await HttpClient(
      `/api/solicitudes/${solicitudeId}`,
      "GET",
      auth.usuario,
      auth.rol
    );

    console.log("response.data:", response.data);
    setsolicitudes(response.data);
    setInitialValues(response.data);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Valores iniciales para la solicitud

  // Configuración de Formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues || {
      number: 0, // Generar un número si es necesario
      herramientas: [],
      fecha: "",
      solicitante: "",
      receptor: "",
      estado: "",
    },
    onSubmit: async (values) => {
      // Si pasa las validaciones, se envía el formulario
      setLoading(true);
      console.log("Valores del formulario:", values);
      values.estado = "Herramientas entregadas"
      const response: ResponseData = await HttpClient(
        `/api/solicitudes`,
        "PUT",
        auth.usuario,
        auth.rol,
        values
      );

      if (response.success) {
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
                    estado: "Disponible",
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
            "Registro creado correctamente y herramientas actualizadas a 'Disponible'!"
          );
          Router.back();
        } catch (error) {
          console.error("Error al actualizar las herramientas:", error);
          toast.warning(
            "Registro creado pero hubo un problema al actualizar las herramientas."
          );
        }
      } else {
        toast.warning(response.message);
      }

      //const response: ResponseData = await HttpClient(
      //  "/api/solicitudes",
      //  "POST",
      //  auth.usuario,
      //  auth.rol,
      //  values
      //);
      //
      //if (response.success) {
      //  toast.success("Registro creado correctamente!");
      //
      //} else {
      //  toast.warning(response.message);
      //}

      setLoading(false);
    },
  });

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
            Editar registro de herramientas prestadas
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
                        {tool.nombre} - {tool.codigo} - {tool.modelo} -
                        {tool.marca} - {tool.ubicacion} - {tool.serie}
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
              {loading ? "Registrando..." : "Registrar herramientas entregas"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarRegistro;
