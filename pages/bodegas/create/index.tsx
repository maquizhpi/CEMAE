/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import { Bodega, Usuario } from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";
import FormatedDate from "../../../controllers/utils/formated_date";

export const BodegasCreate = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usuarioBodeguero, setUsuarioBodeguero] = useState<Usuario[]>([]);

const initialValues: Bodega = {
  _id: "",
  number: 0,
  fechaDeCreacion: FormatedDate(),
  creador: {
    nombre: auth.nombre,
    identificacion: auth.identificacion,
    correo: auth.correo,
    telefono: auth.telefono,
  },
  bodegueroAsignado: {
    nombre: "",
    identificacion: "",
    correo: "",
    telefono: "",
  },
  nombreBodega: "",
  creadorNombre: auth.nombre,
  herramientas: [],
  ubicaciones: [],
  ubicacionesBodega: { nombre: "" },
};


  const loadUserBod = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/user", 
      "GET", 
      auth.usuario, 
      auth.rol);

    const data: Usuario[] = response.data ?? [];
    const bodegueros = data.filter((usuario) => usuario.rol === 1);
    setUsuarioBodeguero(bodegueros);
    setLoading(false);
  };

  useEffect(() => {
    loadUserBod();
  }, []);

  const formik = useFormik<Bodega>({
    initialValues,
    onSubmit: async (values) => {
      if (!values.nombreBodega.trim()) {
        toast.warning("Debe ingresar un nombre para la bodega");
        return;
      }
      if (!values.bodegueroAsignado?.nombre) {
        toast.warning("Debe seleccionar un bodeguero asignado");
        return;
      }
      setLoading(true);
      const response = await HttpClient(
        "/api/bodegas", 
        "POST", 
        auth.usuario, 
        auth.rol, 
        values);
        
      if (response.success) {
        toast.success("Bodega guardada exitosamente.");
        Router.back();
      } else {
        toast.error("Error al guardar la bodega.");
      }
      setLoading(false);
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
                name="creador.nombre"
                value={formik.values.creador.nombre}
                disabled
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
                disabled
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-blue-600 mb-1">
                Bodeguero Asignado
              </label>
              <select
                name="bodegueroAsignado"
                onChange={(e) => {
                  const selected = usuarioBodeguero.find(c => c.id === e.target.value);
                  if (selected) {
                    formik.setFieldValue("bodegueroAsignado", {
                      nombre: selected.nombre,
                      identificacion: selected.identificacion,
                      correo: selected.correo,
                      telefono: selected.telefono
                    });
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              >
                <option value="">Seleccione un bodeguero</option>
                {usuarioBodeguero.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
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