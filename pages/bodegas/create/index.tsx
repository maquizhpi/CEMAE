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
import FormatedDate from "../../../controllers/utils/formated_date";

export const BodegasCreate = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialValues, _setInitialValues] = useState<Bodega>({
    number: 0,
    fechaDeCreacion: FormatedDate(),
    creador: auth.nombre,
    herramientas: [],
    bodegueroAsignado: "",
    nombreBodega: ""
  });

  const [usuarioBodeguero, setusuarioBodeguero] = useState<Array<Usuario>>([]);

  const loadUserBod = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/user",
      "GET",
      auth.usuario,
      auth.rol
    );
    const data: Array<Usuario> = response.data ?? [];
    const bodegueros = data.filter((usuario) => usuario.rol === 1);
    setusuarioBodeguero(bodegueros);
    setLoading(false);
  };

  useEffect(() => {
    loadUserBod();
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
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-6">
        <div className="bg-white w-full max-w-md mx-auto p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-blue-700 text-center mb-6">
            Crear Bodega
          </h1>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-blue-600 mb-1">
                Nombre de la Bodega
              </label>
              <input
                type="text"
                name="nombreBodega"
                value={formik.values.nombreBodega}
                onChange={formik.handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-blue-600 mb-1">
                ¿Quién crea la bodega?
              </label>
              <input
                type="text"
                name="creador"
                value={formik.values.creador}
                onChange={formik.handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-blue-600 mb-1">
                Fecha de Creación
              </label>
              <input
                type="text"
                name="fechaDeCreacion"
                value={formik.values.fechaDeCreacion}
                onChange={formik.handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
                disabled
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-blue-600 mb-1">
                Bodeguero Asignado
              </label>
              <select
                name="bodegueroAsignado"
                value={formik.values.bodegueroAsignado}
                onChange={formik.handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              >
                <option value="">Seleccione un bodeguero</option>
                {usuarioBodeguero.map((usuario) => (
                  <option key={usuario.id} value={usuario.nombre}>
                    {usuario.nombre} - {usuario.identificacion} - {usuario.correo}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Bodega"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BodegasCreate;
