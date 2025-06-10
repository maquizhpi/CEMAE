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

  // Cargar bodegas disponibles
  const loadProducts = async () => {
    setLoading(true);

    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );

    const bodegas = response.data ?? [];
    const bodegasDelUsuario = bodegas.filter(
      (bodega) =>
        bodega.bodegueroAsignado.toLowerCase() === auth.usuario.toLowerCase()
    );

    const herramientasDisponibles = bodegasDelUsuario
      .flatMap((bodega) => bodega.herramientas ?? [])
      .filter((herramienta) => herramienta.estado === "Disponible");

    setHerramientas(herramientasDisponibles);
    setLoading(false);
  };

  // Cargar clientes disponibles
  const loadClient = async () => {
    setLoading(true);

    const response = await HttpClient(
      "/api/user",
      "GET",
      auth.usuario,
      auth.rol
    );

    const clientesDisponibles = (response.data ?? []).filter(
      (clientes: any) => clientes.rol === 2
    );

    setClient(clientesDisponibles);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
    loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialValues: Solicitude = {
    number: 0,
    herramientas: [],
    fecha: FormatedDate(),
    bodeguero: auth?.nombre || "",
    receptor: "",
    estado: "No entregado",
    observacion: ""
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      if (!values.receptor.trim()) {
        toast.warning("El campo 'Receptor' es obligatorio.");
        return;
      }
      if (values.herramientas.length === 0) {
        toast.warning("Debes agregar al menos una herramienta.");
        return;
      }

      setLoading(true);

      const response = await HttpClient(
        "/api/solicitudes",
        "POST",
        auth.usuario,
        auth.rol,
        values
      );

      if (response.success) {
        try {
          const bodegasResponse = await HttpClient(
            "/api/bodegas",
            "GET",
            auth.usuario,
            auth.rol
          );

          const bodegas = bodegasResponse.data ?? [];
          const actualizacionesPorBodega = {};

          for (const herramientaSolicitud of values.herramientas) {
            for (const bodega of bodegas) {
              if (!bodega.herramientas) continue;

              const indiceHerramienta = bodega.herramientas.findIndex(
                h => h.id === herramientaSolicitud.id
              );

              if (indiceHerramienta !== -1) {
                if (!actualizacionesPorBodega[bodega.id]) {
                  actualizacionesPorBodega[bodega.id] = {
                    bodega: bodega,
                    herramientasActualizar: []
                  };
                }

                actualizacionesPorBodega[bodega.id].herramientasActualizar.push({
                  indice: indiceHerramienta,
                  id: herramientaSolicitud.id
                });

                break;
              }
            }
          }

          await Promise.all(
            Object.values(actualizacionesPorBodega).map(async (actualizacion) => {
              //@ts-ignore
              const { bodega, herramientasActualizar } = actualizacion;
              const herramientasActualizadas = [...bodega.herramientas];

              for (const { indice, id } of herramientasActualizar) {
                herramientasActualizadas[indice] = {
                  ...herramientasActualizadas[indice],
                  estado: "En uso"
                };
              }

              const bodegaActualizada = {
                ...bodega,
                herramientas: herramientasActualizadas
              };

              return HttpClient(
                `/api/bodegas/`,
                "PUT",
                auth.usuario,
                auth.rol,
                bodegaActualizada
              );
            })
          );

          toast.success("Registro creado correctamente y herramientas actualizadas a 'En uso'!");
        } catch (error) {
          console.error("Error al actualizar las herramientas:", error);
          toast.warning("Registro creado pero hubo un problema al actualizar las herramientas.");
        }

        Router.back();
      } else {
        toast.warning(response.message);
      }

      setLoading(false);
    },
  });

  const herramientasDisponibles = herramientas.filter(
    (h) => !formik.values.herramientas.some((selected) => selected.id === h.id)
  );

  const toolOptions = herramientasDisponibles.map((tool) => ({
    value: tool.id,
    label: `${tool.nombre} - ${tool.codigo} - ${tool.modelo} - ${tool.marca} - ${tool.ubicacion} - ${tool.serie}`,
  }));

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
            Crear registro de herramientas prestadas
          </h1>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">
                Bodeguero
              </label>
              <input
                type="text"
                name="bodeguero"
                onChange={formik.handleChange}
                value={formik.values.bodeguero}
                className="border p-2 w-full rounded-lg"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">
                Receptor
              </label>
              <select
                name="receptor"
                value={formik.values.receptor}
                onChange={formik.handleChange}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
              >
                <option value="">Seleccione un cliente</option>
                {client.map((ubic) => (
                  <option key={ubic.id} value={ubic.nombre}>
                    {ubic.nombre} - {ubic.correo}
                  </option>
                ))}
              </select>
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

            <div className="mb-4">
              <p className="text-xl font-bold text-blue-500 mb-2">
                Agregar herramientas
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
                        {tool.nombre} - {tool.codigo} - ${tool.modelo} - ${tool.marca} - ${tool.ubicacion} - ${tool.serie}
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
