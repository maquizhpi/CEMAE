/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import { Calibracion, ResponseData } from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../controllers/firebase/config";

export const EditarCalibracion = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<Calibracion | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const loadData = async () => {
    setLoading(true);
    const solicitudeId = Router.query.id as string;
    const response = await HttpClient(
      `/api/calibracion/${solicitudeId}`,
      "GET",
      auth.usuario,
      auth.rol
    );

    setInitialValues(response.data);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues || {
      number: 0,
      herramientas: [],
      fecha: "",
      bodeguero: "",
      estado: "",
      fechaCalibracion: "",
      fechaProximaCalibracion: "",
      empresaDeCalibracion: "",
      observacion: "",
      documentoCalibracion: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      values.estado = "Herramientas calibradas";

      // Subir el PDF si hay uno nuevo
      let documentoURL = formik.values.documentoCalibracion;

      if (file) {
        const storageRef = ref(
          storage,
          `documentosCalibracion/${Date.now()}_${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              documentoURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      const response: ResponseData = await HttpClient(
        `/api/calibracion`,
        "PUT",
        auth.usuario,
        auth.rol,
        {
          ...values,
          documentoCalibracion: documentoURL,
        }
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
                (h) => h.id === herramientaSolicitud.id
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
                  id: herramientaSolicitud.id,
                });
                break;
              }
            }
          }

          await Promise.all(
            Object.values(actualizacionesPorBodega).map(
              async (actualizacion) => {
                //@ts-ignore
                const { bodega, herramientasActualizar } = actualizacion;
                const herramientasActualizadas = [...bodega.herramientas];

                for (const { indice } of herramientasActualizar) {
                  herramientasActualizadas[indice] = {
                    ...herramientasActualizadas[indice],
                    calibracion: "Calibrada",
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

          toast.success("Registro actualizado y herramientas marcadas como 'Calibrada'.");
          Router.back();
        } catch (error) {
          console.error("Error al actualizar herramientas:", error);
          toast.warning("Actualización realizada, pero ocurrió un error al actualizar las herramientas.");
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
            Editar registro de calibración
          </h1>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Bodeguero</label>
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
              <label className="block text-blue-500 font-bold mb-2">Fecha</label>
              <input
                type="text"
                name="fecha"
                value={formik.values.fecha}
                disabled
                className="border p-2 w-full bg-gray-200 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Empresa de Calibración</label>
              <input
                type="text"
                name="empresaDeCalibracion"
                value={formik.values.empresaDeCalibracion}
                onChange={formik.handleChange}
                className="border p-2 w-full rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Fecha Calibración</label>
              <input
                type="date"
                name="fechaCalibracion"
                value={formik.values.fechaCalibracion}
                onChange={formik.handleChange}
                className="border p-2 w-full rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Fecha Próxima Calibración</label>
              <input
                type="date"
                name="fechaProximaCalibracion"
                value={formik.values.fechaProximaCalibracion}
                onChange={formik.handleChange}
                className="border p-2 w-full rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Observación</label>
              <textarea
                name="observacion"
                value={formik.values.observacion}
                onChange={formik.handleChange}
                className="border p-2 w-full rounded-lg"
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Documento de Calibración (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile && selectedFile.type === "application/pdf") {
                    setFile(selectedFile);
                  } else {
                    toast.error("Solo se permite subir archivos PDF.");
                  }
                }}
                className="border p-2 w-full rounded-lg"
              />
            </div>
            <div className="mb-4">
              <p className="text-xl font-bold text-blue-500 mb-2">
                Herramientas calibradas
              </p>
              <ul className="border rounded-lg p-3 bg-gray-50">
                {formik.values.herramientas.map((tool, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center border-b last:border-b-0 p-2"
                  >
                    <span>
                      {tool.nombre} - {tool.codigo} - {tool.modelo} - {tool.marca} - {tool.ubicacion} - {tool.serie}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between space-x-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full mb-2"
              > Registrar calibracion
              </Button>
              <Button
                type="button"
                onClick={() => Router.back()}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg w-full"
              >Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarCalibracion;
