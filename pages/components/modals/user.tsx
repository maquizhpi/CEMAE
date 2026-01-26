import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import Image from "next/image";
import { Usuario, ModalProps } from "../../../models";
import { toast } from "react-toastify";
import theme from "../../../controllers/styles/theme";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../controllers/firebase/config";

const initialUser: Usuario = {
  user: {} as Usuario,
  id: null as any,
  number: 0,
  usuario: "",
  contraseña: "",
  correo: "",
  telefono: "",
  rol: 1,
  nombre: "",
  identificacion: "",
  estado: "",
  imagen: "",
};

interface Props extends ModalProps<Usuario> {
  initialData?: Usuario;
}

const UserModal = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  // archivo seleccionado
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState<Usuario>(initialUser);

  const handleClose = () => {
    formik.resetForm({ values: initialUser });
    setImage(null);
    setPreview(null);
    props.close();
  };

  // helper: subir imagen a Firebase y devolver URL
  const uploadImageToFirebase = async (file: File, username: string) => {
    const safeName = file.name.replace(/\s+/g, "_");
    const storageRef = ref(
      storage,
      `usuarios/${username}/${Date.now()}-${safeName}`
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    const url = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => reject(error),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });

    return url;
  };

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
    initialValues,
    onSubmit: async (formData: Usuario) => {
      if (formData.nombre === "")
        return toast.warning("El nombre no puede estar vacio");
      if (formData.identificacion === "")
        return toast.warning("La cedula no puede estar vacio");
      if (formData.usuario === "")
        return toast.warning("Ingrese un nombre de usuario");
      if (!props.initialData && formData.contraseña === "")
        return toast.warning("Ingrese una contraseña para el usuario");
      if (formData.estado === null || formData.estado === "")
        return toast.warning("Seleccione un estado para el usuario");

      setLoading(true);

      try {
        // Si seleccionó imagen, la subimos y guardamos el link en formData.imagen
        let imageUrl = formData.imagen || "";

        if (image) {
          try {
            imageUrl = await uploadImageToFirebase(image, formData.usuario);
          } catch (error) {
            console.error(error);
            toast.error("Error subiendo imagen");
            return;
          }
        }

        const payload: Usuario = {
          ...formData,
          imagen: imageUrl,
        };

        await props.onDone(payload);

        toast.success("Usuario guardado");
        handleClose();
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (props.initialData) {
      setInitialValues({
        ...props.initialData,
        imagen: (props.initialData as any).imagen || "",
      });

      // preview con imagen existente (Firebase/Mongo link)
      const img = (props.initialData as any).imagen;
      setPreview(img || null);
    } else {
      setInitialValues(initialUser);
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialData]);

  // preview local al seleccionar archivo
  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // liberar blob url
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Para next/image: si preview es blob:, usamos <img> NO, pero next/image no soporta bien blob sin config.
  // Solución: render condicional:
  const isBlob = preview?.startsWith("blob:");

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        props.visible ? "" : "hidden"
      }`}
    >
      <div className="fixed inset-0 bg-black opacity-50"></div>

      <div className="bg-white p-6 rounded shadow-lg z-10 w-2/3 h-5/6 overflow-y-auto">
        <form onSubmit={formik.handleSubmit}>
          <div
            style={{ color: theme.colors.blue }}
            className="text-center text-xl mb-2 font-semibold"
          >
            Usuario
          </div>

          <hr />

          {/* BLOQUE IMAGEN */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-4 mb-4 items-center">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center relative">
                {preview ? (
                  isBlob ? (
                    // Para blob preview, usamos Image igualmente con un workaround:
                    // next/image en algunos proyectos falla con blob. Si te falla, te doy alternativa abajo.
                    <Image
                      src={preview}
                      alt="avatar"
                      fill
                      sizes="112px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src={preview}
                      alt="avatar"
                      fill
                      sizes="112px"
                      className="object-cover"
                      unoptimized
                    />
                  )
                ) : (
                  <span className="text-3xl text-gray-500">
                    {(formik.values.nombre || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <small className="text-gray-500 mt-2">
                La imagen se sube a Firebase y se guarda el enlace en MongoDB.
              </small>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-bold mb-2 block">
                Imagen de perfil
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onSelectImage}
                className="p-2 border rounded w-full"
              />

              <input
                type="hidden"
                name="imagen"
                value={formik.values.imagen || ""}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-3">
            <div>
              <label className="text-gray-700 text-sm font-bold mb-2">
                Nombre del usuario
              </label>
              <input
                className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                placeholder="Nombre de Usuario"
                name="nombre"
                onChange={formik.handleChange}
                value={formik.values.nombre}
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm font-bold mb-2">
                Cedula o RUC
              </label>
              <input
                className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                placeholder="Cedula o Ruc"
                name="identificacion"
                onChange={formik.handleChange}
                value={formik.values.identificacion}
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm font-bold mb-2">
                Nombre de Usuario
              </label>
              <input
                className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                type="text"
                placeholder="Nombre de Usuario"
                name="usuario"
                onChange={formik.handleChange}
                value={formik.values.usuario}
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm font-bold mb-2">
                Contraseña
              </label>
              <input
                className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                type="password"
                placeholder={
                  props.initialData ? "Deja vacío para no cambiar" : "Password"
                }
                name="contraseña"
                onChange={formik.handleChange}
                value={formik.values.contraseña}
              />
              {props.initialData && (
                <small className="text-gray-500">
                  Si estás editando, deja vacío para mantener la contraseña
                  actual.
                </small>
              )}
            </div>

            <div>
              <label className="text-gray-700 text-sm font-bold mb-2">
                E-mail
              </label>
              <input
                className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                type="email"
                placeholder="Correo electrónico"
                name="correo"
                onChange={formik.handleChange}
                value={formik.values.correo}
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm font-bold mb-2">
                Tipo de Rol
              </label>
              <select
                className="border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-4"
                name="rol"
                onChange={(e) =>
                  formik.setFieldValue("rol", parseInt(e.target.value, 10))
                }
                value={formik.values.rol}
              >
                <option value={0}>Administrador</option>
                <option value={1}>Bodeguero</option>
                <option value={2}>Cliente</option>
              </select>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-bold mb-2">
                Estado
              </label>
              <select
                className="border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-4"
                name="estado"
                onChange={formik.handleChange}
                value={formik.values.estado}
              >
                <option value="" disabled>
                  Seleccione una opcion
                </option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <hr />

          <button
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mb-4"
            type="submit"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>

        <button
          className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default UserModal;
