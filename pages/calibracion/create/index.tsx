/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import { Bodega, Calibracion, Herramienta } from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";
import FormatedDate from "../../../controllers/utils/formated_date";
import Select from "react-select";

export const RegistroCreate = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bodegasDelUsuario, setBodegasDelUsuario] = useState<Bodega[]>([]);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<string>("");
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [selectedTool, setSelectedTool] = useState<any>(null);

  // Cargar bodegas al inicio
  const loadBodegas = async () => {
    setLoading(true);

    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );

    const bodegas = response.data ?? [];

    const bodegasFiltradas = auth.rol === 0
      ? bodegas
      : bodegas.filter(
          (bodega) =>
            bodega.bodegueroAsignado?.identificacion === auth.identificacion
        );

    setBodegasDelUsuario(bodegasFiltradas);
    if (bodegasFiltradas.length > 0) {
      setBodegaSeleccionada(bodegasFiltradas[0].id); // primera seleccionada
    }

    setLoading(false);
  };

  // Cuando cambia la bodega → cargar herramientas de esa bodega
  useEffect(() => {
    if (!bodegaSeleccionada) return;

    const bodega = bodegasDelUsuario.find((b) => b.id === bodegaSeleccionada);

    const herramientasDisponibles = (bodega?.herramientas ?? [])
      .filter(
        (herramienta) =>
          herramienta.estado === "Disponible" &&
          (herramienta.calibracion === "Calibrada" ||
            herramienta.calibracion === "No calibrada")
      )
      .map((h) => ({
        ...h,
        id: h.id || h._id,
      }));

    setHerramientas(herramientasDisponibles);
  }, [bodegaSeleccionada, bodegasDelUsuario]);


 // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadBodegas();  
  }, []);

  const initialValues: Calibracion = {
    number: 0,
    herramientas: [],
    fecha: FormatedDate(),
    bodeguero: auth?.nombre || "",
    estado: "En calibracion",
    fechaCalibracion: "",
    fechaProximaCalibracion: "",
    empresaDeCalibracion: "",
    observacion: "",
    documentoCalibracion: "",
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      if (values.herramientas.length === 0) {
        toast.warning("Debes agregar una herramienta.");
        return;
      }

      setLoading(true);

      try {
        const response = await HttpClient(
          "/api/calibracion",
          "POST",
          auth.usuario,
          auth.rol,
          values
        );

        if (response.success) {
          toast.success("Registro creado correctamente.");
          Router.back();
        } else {
          toast.warning(response.message);
        }
      } catch (error) {
        console.error("Error al registrar la calibración:", error);
        toast.error("Error al registrar la calibración.");
      } finally {
        setLoading(false);
      }
    },
  });

  const herramientasDisponibles = herramientas.filter(
    (h) => !formik.values.herramientas.some((selected) => selected.id === h.id)
  );

  const toolOptions = herramientasDisponibles.map((tool) => ({
    value: tool.id,
    label: `${tool.nombre} - ${tool.codigo} - ${tool.modelo} - ${tool.marca} - ${tool.ubicacion} - ${tool.serie}`,
  }));

  const addHerramienta = () => {
    if (!selectedTool || formik.values.herramientas.length >= 1) return;
    const selectedToolData = herramientas.find(
      (tool) => tool.id === selectedTool.value
    );
    if (selectedToolData) {
      formik.setFieldValue("herramientas", [selectedToolData]);
      setSelectedTool(null);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4 overflow-y-scroll">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
            Crear registro de herramientas para calibrar
          </h1>
          <form onSubmit={formik.handleSubmit}>
            {/* Bodeguero */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Bodeguero</label>
              <input
                type="text"
                name="bodeguero"
                onChange={formik.handleChange}
                value={formik.values.bodeguero}
                className="border p-2 w-full rounded-lg"
                disabled
              />
            </div>

            {/* Fecha */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Fecha</label>
              <input
                type="text"
                name="fecha"
                value={formik.values.fecha}
                disabled
                className="border p-2 w-full bg-gray-200 rounded-lg"
              />
            </div>

            {/* Selección de Bodega */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Seleccionar Bodega</label>
              <select
                value={bodegaSeleccionada}
                onChange={(e) => setBodegaSeleccionada(e.target.value)}
                className="border p-2 w-full rounded-lg"
              >
                {bodegasDelUsuario.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombreBodega}
                  </option>
                ))}
              </select>
            </div>

            {/* Seleccionar herramienta */}
            <div className="mb-4">
              <p className="text-xl font-bold text-blue-500 mb-2">
                Seleccionar herramienta
              </p>
              <div className="flex items-center gap-2">
                <div className="w-full">
                  <Select
                    value={selectedTool}
                    onChange={setSelectedTool}
                    options={toolOptions}
                    isSearchable
                    placeholder="Buscar herramienta..."
                    className="w-full"
                    isDisabled={formik.values.herramientas.length >= 1}
                  />
                </div>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                  type="button"
                  onClick={addHerramienta}
                >
                  Agregar
                </Button>
              </div>
            </div>

            {/* Herramienta agregada */}
            {formik.values.herramientas.length > 0 && (
              <div className="mb-4">
                <p className="text-xl font-bold text-blue-500 mb-2">
                  Herramienta seleccionada
                </p>
                <ul className="border rounded-lg p-3 bg-gray-50">
                  {formik.values.herramientas.map((tool, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center border-b last:border-b-0 p-2"
                    >
                      <span>
                        {tool.nombre} - {tool.codigo} - {tool.modelo} -{" "}
                        {tool.marca} - {tool.ubicacion} - {tool.serie}
                      </span>
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg"
                        size="sm"
                        onClick={() => {
                          formik.setFieldValue("herramientas", []);
                        }}
                      >
                        Eliminar
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Empresa */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">
                Empresa de Calibración
              </label>
              <input
                type="text"
                name="empresaDeCalibracion"
                value={formik.values.empresaDeCalibracion}
                onChange={formik.handleChange}
                className="border p-2 w-full rounded-lg"
              />
            </div>

            {/* Observación */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">
                Observación
              </label>
              <textarea
                name="observacion"
                value={formik.values.observacion}
                onChange={formik.handleChange}
                className="border p-2 w-full rounded-lg"
                rows={3}
              />
            </div>

            {/* Botón Enviar */}
          <div className="flex justify-between space-x-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              {loading ? "Enviando..." : "Enviar Registro"}
            </Button>
            <Button
              as="button"
              type="button"
              onClick={() => {
                Router.push("/calibracion"); 
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Cancelar
            </Button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroCreate;
