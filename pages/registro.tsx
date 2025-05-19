/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useAuth } from "../controllers/hooks/use_auth";
import HttpClient from "../controllers/utils/http_client";
import { Usuario } from "../models";
import LoadingContainer from "./components/loading_container";
import Router from "next/router";

const currentYear = new Date().getFullYear();
// login de la app
const Register = () => {
  const [loading, setLoading] = useState<boolean>(false);
  // llama la funcion para iniciar sesion
  const { login } = useAuth();

  // valores del formulario
  const [initialValues, _setInitialValues] = useState<Usuario>({
    number: 0,
    identificacion: "",
    usuario: "",
    contraseña: "",
    nombre: "",
    correo: "",
    telefono: "",
    rol: 2,
    estado: "Activo",
  });

  // envia los datos del formulario
  const onSubmit = async (formData: Usuario) => {
    setLoading(true);
    const response = await HttpClient("/api/user", "POST", "", -1, formData);
    if (response.success) {
      const data = response.data;
      login(data);
      console.log(formData);
      toast.success("Usuario creado correctamente");
      Router.push({ pathname: "/login" });
    } else {
      toast.warning(response.message);
    }
    setLoading(false);
  };

  // maneja los datos y comportamiento del formulario
  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
    initialValues,
    onSubmit,
  });

  return (
    <>
      <title>Registro de usuario</title>
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
        <div className="flex flex-col items-center justify-center rounded-3xl shadow-lg bg-white w-full max-w-md p-8">
          <h2 className="text-center text-3xl font-extrabold text-blue-800 mb-6">
            Registro de usuario
          </h2>

          <LoadingContainer visible={loading} miniVersion>
            <form onSubmit={formik.handleSubmit} className="w-full">
              <div className="mb-6">
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  name="usuario"
                  value={formik.values.usuario}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su usuario"
                  className="mt-1 block w-full h-12 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  name="contraseña"
                  value={formik.values.contraseña}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su contraseña"
                  className="mt-1 block w-full h-12 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su nombre"
                  className="mt-1 block w-full h-12 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="identificacion"
                  className="block text-sm font-medium text-gray-700"
                >
                  Identificacion del usuario
                </label>
                <input
                  type="text"
                  name="identificacion"
                  value={formik.values.identificacion}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su identificacion"
                  className="mt-1 block w-full h-12 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="correo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electronico
                </label>
                <input
                  type="text"
                  name="correo"
                  value={formik.values.correo}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su correo"
                  className="mt-1 block w-full h-12 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Telefono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={formik.values.telefono}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su telefono"
                  className="mt-1 block w-full h-12 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                Crear usuario
              </button>
            </form>
          </LoadingContainer>
        </div>
      </section>
    </>
  );
};

export default Register;
