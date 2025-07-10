/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useAuth } from "../controllers/hooks/use_auth";
import HttpClient from "../controllers/utils/http_client";
import { Usuario } from "../models";
import LoadingContainer from "./components/loading_container";
import Router from "next/router";

const Register = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

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

  // ✅ Validación personalizada
  const validate = (values: Usuario) => {
    const errors: Partial<Usuario> = {};

    if (!values.contraseña) {
      errors.contraseña = "La contraseña es obligatoria";
    } else if (values.contraseña.length < 6) {
      errors.contraseña = "Mínimo 6 caracteres";
    }

    if (!values.nombre) errors.nombre = "El nombre es obligatorio";

    if (!values.identificacion) {
      errors.identificacion = "La identificación es obligatoria";
    } else if (!/^\d{10}$/.test(values.identificacion)) {
      errors.identificacion = "Debe tener exactamente 10 dígitos numéricos";
    }

    if (!values.correo) {
      errors.correo = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(values.correo)) {
      errors.correo = "Formato de correo inválido";
    }

    if (!values.telefono) {
      errors.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(values.telefono)) {
      errors.telefono = "Debe tener exactamente 10 dígitos numéricos";
    }

    return errors;
  };

  const onSubmit = async (formData: Usuario) => {
    setLoading(true);
    const response = await HttpClient(
      "/api/user", 
      "POST", 
      "", -1, 
      formData);
      
    if (response.success) {
      const data = response.data;
      login(data);
      toast.success("Usuario creado correctamente");
      Router.push({ pathname: "/login" });
    } else {
      toast.warning(response.message);
    }
    setLoading(false);
  };

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
    initialValues,
    validate,
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
              {/* Usuario */}
              {/* Correo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="text"
                  name="correo"
                  value={formik.values.correo}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su correo"
                  className="mt-1 block w-full h-12 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.correo && formik.errors.correo && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.correo}</p>
                )}
              </div>
              
              {/* Contraseña */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  name="contraseña"
                  value={formik.values.contraseña}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su contraseña"
                  className="mt-1 block w-full h-12 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.contraseña && formik.errors.contraseña && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.contraseña}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su nombre"
                  className="mt-1 block w-full h-12 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.nombre && formik.errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.nombre}</p>
                )}
              </div>

              {/* Identificación */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Identificación del usuario</label>
                <input
                  type="text"
                  name="identificacion"
                  value={formik.values.identificacion}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su identificación"
                  className="mt-1 block w-full h-12 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.identificacion && formik.errors.identificacion && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.identificacion}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formik.values.telefono}
                  onChange={formik.handleChange}
                  placeholder="Ingrese su teléfono"
                  className="mt-1 block w-full h-12 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.telefono && formik.errors.telefono && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.telefono}</p>
                )}
              </div>

              {/* Botón */}
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
