/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useAuth } from "../controllers/hooks/use_auth";
import HttpClient from "../controllers/utils/http_client";
import { LoginData } from "../models";
import LoadingContainer from "./components/loading_container";
import Router from "next/router";
import Cookies from "js-cookie";

const currentYear = new Date().getFullYear();
// login de la app
const LoginPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  // llama la funcion para iniciar sesion
  const { login } = useAuth();

  // valores del formulario
  const [initialValues, _setInitialValues] = useState<LoginData>({
    usuario: "",
    contraseña: "",
  });

  // envia los datos del formulario
  const onSubmit = async (formData: LoginData) => {
    setLoading(true);
    const response = await HttpClient("/api/login", "POST", "", -1, formData);
    if (response.success) {
      const data = response.data;
      login(data);

      // ✅ Redirección por tipo de usuario
      if (data.rol === 0) {
        Router.push("/dashboard/admin");
      } else if (data.rol === 1) {
        Router.push("/dashboard/bodeguero");
      } else {
        Router.push("/dashboard/cliente");
      }
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

  const handleRegister = () => {
    setLoading(true);

    Router.push({ pathname: "/registro" });
  };

  const handleRecuperarClave = () => {
    setLoading(true);

    Router.push({ pathname: "/recuperar" });
  };

  return (
    <>
      <title>Inicio de sesión</title>
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
        <div className="flex flex-col items-center justify-center rounded-3xl shadow-lg bg-white w-full max-w-md p-8">
          <h2 className="text-center text-3xl font-extrabold text-blue-800 mb-6">
            Sistema de herramientas
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

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                Iniciar Sesión
              </button>
            </form>
            <button
              onClick={handleRegister}
              className="w-full mt-3 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
            >
              Registrarse
            </button>
            <button
              onClick={handleRecuperarClave}
              className="w-full mt-3 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Recuperar contraseña
            </button>
          </LoadingContainer>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
