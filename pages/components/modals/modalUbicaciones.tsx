import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { ModalProps, Ubicaciones, Bodega } from "../../../models";
import { toast } from "react-toastify";
import { useAuth } from "../../../controllers/hooks/use_auth";
import HttpClient from "../../../controllers/utils/http_client";
import theme from "../../../controllers/styles/theme";

const initialUser: Ubicaciones = {
  id: null,
  nombre: "",
  bodega: "",
  bodegueroAsignado: {
    nombre: "",
    identificacion: "",
    correo: "",
    telefono: "",
  },
};

interface Props extends ModalProps<Ubicaciones> {
  initialData?: Ubicaciones;
}

const UbicacionesModal = (props: Props) => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<Ubicaciones>(initialUser);
  const [bodegasDelUsuario, setBodegasDelUsuario] = useState<Bodega[]>([]);
  

  const handleClose = () => {
    formik.resetForm({ values: initialUser });
    props.close();
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: async (formData: Ubicaciones) => {
      if (!formData.nombre) {
        toast.warning("El nombre de la ubicación no puede estar vacío");
        return;
      }
      if (!formData.bodega) {
        toast.warning("Debe seleccionar una bodega");
        return;
      }

      setLoading(true);
      await props.onDone(formData);
      setLoading(false);
      handleClose();
    },
  });

  // Cargar bodegas según el rol del usuario
  const loadBodegas = async () => {
    try {
      const response = await HttpClient(
        "/api/bodegas", 
        "GET", 
        auth.usuario, 
        auth.rol
      );
      if (response.success) {
        const bodegas: Bodega[] = response.data ?? [];
        if (auth.rol === 1) {
          const bodegasUsuario = bodegas.filter(
            (b) =>
              b.bodegueroAsignado?.identificacion === auth.identificacion
          );
          setBodegasDelUsuario(bodegasUsuario);
        } else {
          setBodegasDelUsuario(bodegas);
        }
      } else {
        toast.warning(response.message);
      }
    } catch (err) {
      toast.error("Error al cargar bodegas");
    }
  };

  useEffect(() => {
    if (props.initialData) {
      setInitialValues(props.initialData);
    }
    loadBodegas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialData]);

  return (
    <>
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${props.visible ? "" : "hidden"}`}>
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="bg-white p-6 rounded shadow-lg z-10 w-2/3 h-5/6 overflow-y-auto">
          <form onSubmit={formik.handleSubmit}>
            <div style={{ color: theme.colors.blue }} className="text-center text-xl mb-2 font-semibold">
              Crear/Editar ubicación
            </div>
            <hr />
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-3">

              {/* Campo: Nombre */}
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2">Nombre de la ubicación</label>
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="text"
                  placeholder="Nombre de la ubicación"
                  name="nombre"
                  onChange={formik.handleChange}
                  value={formik.values.nombre}
                />
              </div>

              {/* Campo: Bodega */}
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2">Seleccionar Bodega</label>
                <select
                  name="bodega"
                  value={formik.values.bodega}
                  onChange={(e) => {
                    const selected = e.target.value;
                    formik.setFieldValue("bodega", selected);

                    const bodegaSeleccionada = bodegasDelUsuario.find(
                      (b) => b.nombreBodega === selected
                    );

                    if (bodegaSeleccionada) {
                      formik.setFieldValue("bodegueroAsignado", bodegaSeleccionada.bodegueroAsignado);
                    } else {
                      formik.setFieldValue("bodegueroAsignado", initialUser.bodegueroAsignado);
                    }
                  }}
                  className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="">Seleccione una bodega</option>
                  {bodegasDelUsuario.map((bodega) => (
                    <option key={bodega.id} value={bodega.nombreBodega}>
                      {bodega.nombreBodega}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mostrar datos del bodeguero asignado */}
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2">Bodeguero Asignado</label>
                <input
                  type="text"
                  value={formik.values.bodegueroAsignado?.nombre || ""}
                  readOnly
                  placeholder="Nombre"
                  className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 mb-2 text-gray-700 bg-gray-100"
                />
              </div>
            </div>
            <hr />
            <button
              type="submit"
              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mb-4"
            >
              Guardar
            </button>
          </form>
          <button
            className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
            onClick={handleClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};

export default UbicacionesModal;
