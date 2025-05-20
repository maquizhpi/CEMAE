/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import { Solicitude, Herramienta, ResponseData } from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";

// Tipo extendido solo para esta vista
type HerramientaConEntrega = Herramienta & { entregada?: boolean };

export const EditarRegistro = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<{
    number: number;
    herramientas: HerramientaConEntrega[];
    fecha: string;
    solicitante: string;
    receptor: string;
    estado: string;
    observacion?: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const solicitudeId = Router.query.id as string;

    const response = await HttpClient(
      `/api/solicitudes/${solicitudeId}`,
      "GET",
      auth.usuario,
      auth.rol
    );

    const solicitud = response.data;

    solicitud.herramientas = solicitud.herramientas.map((h: HerramientaConEntrega) => ({
      ...h,
      entregada: true,
    }));

    setInitialValues({
      ...solicitud,
      observacion: solicitud.observacion || "",
    });

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues || {
      number: 0,
      herramientas: [],
      fecha: "",
      solicitante: "",
      receptor: "",
      estado: "",
      observacion: "",
    },
    onSubmit: async (values) => {
      setLoading(true);

      const total = values.herramientas.length;
      const entregadas = values.herramientas.filter(h => h.entregada !== false).length;

      values.estado =
        entregadas === total
          ? "Herramientas entregadas"
          : "Faltan herramientas por entregar";

      values.herramientas = values.herramientas.map((h) => ({
        ...h,
        entregada: h.entregada !== false,
      }));

      const response: ResponseData = await HttpClient(
        `/api/solicitudes`,
        "PUT",
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
          const actualizacionesPorBodega: {
            [key: string]: {
              bodega: any;
              herramientasActualizar: { indice: number; id: string }[];
            };
          } = {};

          for (const herramienta of values.herramientas.filter(h => h.entregada !== false)) {
            for (const bodega of bodegas) {
              if (!bodega.herramientas) continue;

              const indiceHerramienta = bodega.herramientas.findIndex(
                (h) => h.id === herramienta.id
              );

              if (indiceHerramienta !== -1) {
                if (!actualizacionesPorBodega[bodega.id]) {
                  actualizacionesPorBodega[bodega.id] = {
                    bodega: bodega,
                    herramientasActualizar: [],
                  };
                }

                actualizacionesPorBodega[bodega.id].herramientasActualizar.push({
                  indice: indiceHerramienta,
                  id: herramienta.id,
                });

                break;
              }
            }
          }

          await Promise.all(
            Object.values(actualizacionesPorBodega).map(
              async ({ bodega, herramientasActualizar }) => {
                const herramientasActualizadas = [...bodega.herramientas];

                for (const { indice } of herramientasActualizar) {
                  herramientasActualizadas[indice] = {
                    ...herramientasActualizadas[indice],
                    estado: "Disponible",
                  };
                }

                const bodegaActualizada = {
                  ...bodega,
                  herramientas: herramientasActualizadas,
                };

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

          toast.success("Entrega registrada correctamente.");
          Router.back();
        } catch (error) {
          console.error("Error al actualizar herramientas:", error);
          toast.warning("Entrega registrada, pero falló la actualización de herramientas.");
        }
      } else {
        toast.warning(response.message);
      }

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
            {/* Datos generales */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Solicitante</label>
              <input
                type="text"
                name="solicitante"
                value={formik.values.solicitante}
                className="border p-2 w-full rounded-lg"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Receptor</label>
              <input
                type="text"
                name="receptor"
                value={formik.values.receptor}
                className="border p-2 w-full rounded-lg"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Fecha</label>
              <input
                type="text"
                name="fecha"
                value={formik.values.fecha}
                disabled
                className="border p-2 w-full bg-gray-200 rounded-lg"
              />
            </div>

            {/* Observación */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Observación</label>
              <textarea
                name="observacion"
                value={formik.values.observacion}
                onChange={formik.handleChange}
                className="border p-2 w-full rounded-lg"
                rows={3}
                placeholder="Ejemplo: Faltó herramienta por daño, cliente firmó sin recibir completa."
              />
            </div>

            {/* Herramientas */}
            <div className="mb-4">
              <p className="text-xl font-bold text-blue-500 mb-2">Herramientas agregadas</p>
              {formik.values.herramientas.length === 0 ? (
                <p className="text-gray-500">No hay herramientas agregadas.</p>
              ) : (
                <ul className="border rounded-lg p-3 bg-gray-50">
                  {formik.values.herramientas.map((tool, index) => (
                    <li
                      key={index}
                      className={`flex justify-between items-center border-b last:border-b-0 p-2 ${
                        tool.entregada === false ? "bg-red-100" : ""
                      }`}
                    >
                      <span>
                        {tool.nombre} - {tool.codigo} - {tool.modelo} - {tool.marca} - {tool.ubicacion} - {tool.serie}
                      </span>
                      <Button
                        className={`font-bold py-1 px-3 rounded-lg text-white ${
                          tool.entregada === false
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        size="sm"
                        onClick={() => {
                          const updatedTools = [...formik.values.herramientas];
                          updatedTools[index] = {
                            ...updatedTools[index],
                            entregada: !(tool.entregada !== false), // toggle entre true y false
                          };
                          formik.setFieldValue("herramientas", updatedTools);
                        }}
                      >
                        {tool.entregada === false ? "No entrega" : "Entregar"}
                      </Button>

                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              {loading ? "Registrando..." : "Registrar entrega"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarRegistro;
