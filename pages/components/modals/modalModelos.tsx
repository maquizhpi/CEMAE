import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { ModalProps, ModelosHerramienta } from "../../../models";
import { toast } from "react-toastify";
import { useAuth } from "../../../controllers/hooks/use_auth";
import theme from "../../../controllers/styles/theme";

const initialUser: ModelosHerramienta = {
  id: null,
  nombre: "",
};

interface Props extends ModalProps<ModelosHerramienta> {
  initialData?: ModelosHerramienta;
}

const ModalModelos = (props: Props) => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<ModelosHerramienta>(initialUser);

  const handleClose = () => {
    formik.resetForm({ values: initialUser });
    props.close();
  };

  // maneja los datos y comportamiento del formulario
  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
    initialValues,
    onSubmit: async (formData: ModelosHerramienta) => {
      if (formData.nombre === "") {
        toast.warning("El nombre del modelo no puede estar vacio");
        return;
      }

      setLoading(true);
      console.log(formData);
      await props.onDone(formData);
      setLoading(false);
      handleClose();
    },
  });

  useEffect(() => {
    if (props.initialData) setInitialValues(props.initialData);
  }, [props.initialData]);

  return (
    <>
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
              Crear/Editar modelo
            </div>
            <hr />
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-3">
              <div>
                <label className="text-gray-700 text-sm font-bold mb-2">
                  Nombre del modelo
                </label>

                <input
                  className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="text"
                  placeholder="Nombre del modelo"
                  name="nombre"
                  onChange={formik.handleChange}
                  value={formik.values.nombre}
                />
              </div>
            </div>
            <hr />
            <button
              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mb-4"
              type="submit"
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
export default ModalModelos;
