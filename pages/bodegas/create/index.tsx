/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import {
  Bodega,
  Herramienta,
  ModelosHerramienta,
  ResponseData,
  Ubicaciones,
  Usuario,
} from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";
import { UploadSolicitudeImages } from "../../../controllers/utils/upload_solicitude_images";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../controllers/firebase/config";
import FormatedDate from "../../../controllers/utils/formated_date";

export const BodegasCreate = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<File>(null);
  const [initialValues, _setInitialValues] = useState<Bodega>({
    number: 0,
    fechaDeCreacion: FormatedDate(),
    creador: auth.nombre,
    herramientas: [],
    bodegueroAsignado: "",
    nombreBodega: ""
  });
  const [usuarioBodeguero, setusuarioBodeguero] = useState<Array<Usuario>>([]);
  const [modelos, setmodelos] = useState<Array<ModelosHerramienta>>([]);
  const [ubicaciones, setubicaciones] = useState<Array<Ubicaciones>>([]);
  const [herramientaTemp, setHerramientaTemp] = useState<Herramienta>({
    nombre: "",
    codigo: "",
    descripcion: "",
    serie: "",
    modelo: "",
    marca: "",
    NParte: "",
    ubicacion: "",
    estado: "",
    imagen: "",
    tipo: "",
    cantidad: 1,
    observacion: "",
    calibracion: "",
  });

  const loadUserBod = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/user",
      "GET",
      auth.usuario,
      auth.rol
    );
    const data: Array<Usuario> = response.data ?? [];

    // Filtrar usuarios con rol === 1
    const bodegueros = data.filter((usuario) => usuario.rol === 1);

    console.log(bodegueros);
    setusuarioBodeguero(bodegueros);
    setLoading(false);
  };

  const loadModelos = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/modelos",
      "GET",
      auth.usuario,
      auth.rol
    );
    const data: Array<ModelosHerramienta> = response.data ?? [];

    console.log(data);
    setmodelos(data);
    setLoading(false);
  };

  const loadUbiciones = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/ubicaciones",
      "GET",
      auth.usuario,
      auth.rol
    );
    const data: Array<Ubicaciones> = response.data ?? [];

    console.log(data);
    setubicaciones(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUserBod();
    loadModelos();
    loadUbiciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formik = useFormik<Bodega>({
    enableReinitialize: true,
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
    initialValues,
    onSubmit: async (formData) => {
      setLoading(true);
      try {
        const response = await HttpClient(
          "/api/bodegas",
          "POST",
          auth.usuario,
          auth.rol,
          formData
        );

        toast.success("Bodega guardada exitosamente.");
        console.log("Respuesta del backend:", response);

        Router.back();
      } catch (error) {
        console.error("Error al guardar la bodega:", error);
        toast.error("Error al guardar la bodega.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <div className="flex h-screen">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 bg-blue-100">
          <div className="bg-white w-5/6 h-auto mx-auto my-10">
            <div>
              <p className="md:text-3xl text-xl text-center pt-5 font-extrabold text-blue-500">
                Crear Bodega
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 px-4 py-2">
            <div>
                <label>Nombre de la bodega</label>
                <input
                  type="text"
                  placeholder="Escribe el Nombre de la bodega"
                  name="nombreBodega"
                  value={formik.values.nombreBodega}
                  onChange={formik.handleChange}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                />
              </div>
              <div>
                <label>¿Quién crea la bodega?</label>
                <input
                  type="text"
                  placeholder="¿Quién crea la bodega?"
                  name="creador"
                  value={formik.values.creador}
                  onChange={formik.handleChange}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                />
              </div>

              <div>
                <label>Fecha de creacion</label>
                <input
                  type="text"
                  placeholder="Fecha de creacion"
                  name="fechaDeCreacion"
                  value={formik.values.fechaDeCreacion}
                  onChange={formik.handleChange}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                />
              </div>
              <div>
                <label>Bodeguero asignado</label>
                <input
                  type="text"
                  placeholder="Bodeguero asignado"
                  list="usuarios-creadores"
                  name="bodegueroAsignado"
                  value={formik.values.bodegueroAsignado}
                  onChange={formik.handleChange}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                />
                <datalist id="usuarios-creadores">
                  {usuarioBodeguero.map((usuario) => (
                    <option key={usuario.id} value={usuario.nombre} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="text-center py-5">
              <button
                type="button"
                onClick={() => formik.handleSubmit()}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Bodega"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BodegasCreate;
