/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useAuth } from "../controllers/hooks/use_auth";
import HttpClient from "../controllers/utils/http_client";
import { Usuario } from "../models";
import LoadingContainer from "./components/loading_container";
import Router from "next/router";

const currentYear = new Date().getFullYear();
// login de la app
const RecuperarClave = () => {
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
  const [usuarioBodeguero, setusuarioBodeguero] = useState<Array<Usuario>>([]);

  // envia los datos del formulario
  const onSubmit = async (formData: Usuario) => {
    setLoading(true);

    // Buscar si existe un usuario con ese correo y nombre de usuario
    const usuarioEncontrado = usuarioBodeguero.find(
      (u) =>
        u.usuario.toLowerCase() === formData.usuario.toLowerCase() &&
        u.correo.toLowerCase() === formData.correo.toLowerCase()
    );

    if (!usuarioEncontrado) {
      toast.error("Usuario o correo no válido");
      setLoading(false);
      return;
    }

    // Clonar el usuario encontrado, pero actualizar solo la contraseña
    const usuarioActualizado: Usuario = {
      ...usuarioEncontrado,
      contraseña: formData.contraseña, // nueva clave
    };

    try {
      const response = await HttpClient(
        "/api/user",
        "PUT",
        "",
        -1,
        usuarioActualizado
      );
      if (response.success) {
        toast.success("Contraseña reestablecida exitosamente");
        Router.push({ pathname: "/login" });
      } else {
        toast.error(response.message || "Error al actualizar la contraseña");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al actualizar la contraseña");
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

  const loadUserBod = async () => {
    setLoading(true);
    const response = await HttpClient("/api/user", "GET", "", -1);
    const data: Array<Usuario> = response.data ?? [];

    console.log(data);
    setusuarioBodeguero(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUserBod();
   
  }, []);

  return (
    <>
      <title>Reestablecimiento contraseña</title>
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
        <div className="flex flex-col items-center justify-center rounded-3xl shadow-lg bg-white w-full max-w-md p-8">
          <h2 className="text-center text-3xl font-extrabold text-blue-800 mb-6">
            Reestablecimiento de contraseña
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
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nueva contraseña
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
                Recuperar clave
              </button>
            </form>
          </LoadingContainer>
        </div>
      </section>
    </>
  );
};

export default RecuperarClave;
