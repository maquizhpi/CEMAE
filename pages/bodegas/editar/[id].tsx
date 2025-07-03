/* eslint-disable react/jsx-no-target-blank */
// Este componente permite editar una bodega: ver, agregar, editar y eliminar herramientas asociadas

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import Router from "next/router";
import { useAuth } from "../../../controllers/hooks/use_auth";
import HttpClient from "../../../controllers/utils/http_client";
import Sidebar from "../../components/sidebar";
import {
  Bodega,
  Herramienta,
  ModelosHerramienta,
  Ubicaciones,
  ResponseData,
} from "../../../models";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../controllers/firebase/config";

const EditarBodega = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<Bodega | null>(null);
  const [editingToolIndex, setEditingToolIndex] = useState<number | null>(null);
  const [toolTemp, setToolTemp] = useState<Herramienta>({
    _id: "",
    nombre: "",
    codigo: "",
    descripcion: "",
    serie: "",
    modelo: "",
    marca: "",
    NParte: "",
    ubicacion: "",
    estado: "",
    imagen: "",
    tipo: "",
    cantidad: 1,
    observacion: "",
    calibracion: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [modelos, setmodelos] = useState<Array<ModelosHerramienta>>([]);
  const [ubicaciones, setubicaciones] = useState<Array<Ubicaciones>>([]);

  const loadModelos = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/modelos",
      "GET",
      auth.usuario,
      auth.rol
    );
    setmodelos(response.data ?? []);
    setLoading(false);
  };

  const loadUbiciones = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/ubicaciones",
      "GET",
      auth.usuario,
      auth.rol
    );
    setubicaciones(response.data ?? []);
    setLoading(false);
  };

  const loadData = async () => {
    if (Router.asPath !== Router.route) {
      setLoading(true);
      const bodegaID = Router.query.id as string;
      const response: ResponseData = await HttpClient(
        `/api/bodegas/${bodegaID}`,
        "GET",
        auth.usuario,
        auth.rol
      );

      if (response.success) {
        setInitialValues(response.data);
      } else {
        toast.error("Bodega no encontrada");
      }
      setLoading(false);
    } else {
      setTimeout(loadData, 1000);
    }
  };

  useEffect(() => {
    loadData();
    loadModelos();
    loadUbiciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formik = useFormik<Bodega>({
    enableReinitialize: true,
    initialValues: initialValues || {
      number: 0,
      creador: "",
      fechaDeCreacion: "",
      bodegueroAsignado: "",
      nombreBodega: "",
      herramientas: [],
    },
    onSubmit: async (formData) => {
      setLoading(true);
      const response: ResponseData = await HttpClient(
        `/api/bodegas`,
        "PUT",
        auth.usuario,
        auth.rol,
        formData
      );

      if (response.success) {
        toast.success("Bodega actualizada correctamente!");
        Router.push(`/bodegas`);
      } else {
        toast.warning(response.message);
      }
      setLoading(false);
    },
  });

  const handleToolSave = async () => {
    if (!toolTemp.nombre || !toolTemp.codigo) {
      toast.warning("Faltan campos obligatorios.");
      return;
    }

    let imageUrl = toolTemp.imagen;
    if (image) {
      try {
        const storageRef = ref(storage, `herramientas/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            () => {},
            (error) => reject(error),
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } catch (error) {
        toast.error("Error subiendo la imagen");
        return;
      }
    }

    const nueva = { ...toolTemp, imagen: imageUrl };
    const herramientas = [...formik.values.herramientas];

    if (editingToolIndex !== null) {
      herramientas[editingToolIndex] = nueva;
    } else {
      herramientas.push(nueva);
    }

    formik.setFieldValue("herramientas", herramientas);
    setToolTemp({
      _id: "",
      nombre: "",
      codigo: "",
      descripcion: "",
      serie: "",
      modelo: "",
      marca: "",
      NParte: "",
      ubicacion: "",
      estado: "",
      imagen: "",
      tipo: "",
      cantidad: 1,
      observacion: "",
      calibracion: "",
    });
    setImage(null);
    setEditingToolIndex(null);
  };

  const handleToolEdit = (index: number) => {
    setEditingToolIndex(index);
    setToolTemp(formik.values.herramientas[index]);
  };

  const handleToolDelete = (index: number) => {
    const updated = formik.values.herramientas.filter((_, i) => i !== index);
    formik.setFieldValue("herramientas", updated);
  };

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100">
        <div className="w-full bg-blue-100 p-8">
          <div className="bg-white p-6 rounded shadow mx-auto">
            <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">
              Editar Bodega #{initialValues?.number}
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  disabled
                  value={formik.values.creador}
                  name="creador"
                  className="p-2 border rounded"
                />
                <input
                  disabled
                  value={formik.values.fechaDeCreacion}
                  name="fechaDeCreacion"
                  className="p-2 border rounded"
                />
                <input
                  disabled
                  value={formik.values.bodegueroAsignado}
                  name="bodegueroAsignado"
                  onChange={formik.handleChange}
                  className="p-2 border rounded"
                />
              </div>

              <h3 className="text-xl font-semibold mt-6">Herramientas</h3>

              <div className="grid grid-cols-2 gap-4">
                <input
                  value={toolTemp.nombre}
                  placeholder="Nombre"
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, nombre: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <input
                  value={toolTemp.codigo}
                  placeholder="Código"
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, codigo: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <input
                  value={toolTemp.descripcion}
                  placeholder="Descripción"
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, descripcion: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <input
                  value={toolTemp.serie}
                  placeholder="Serie"
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, serie: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <select
                  value={toolTemp.modelo}
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, modelo: e.target.value })
                  }
                  className="p-2 border rounded"
                >
                  <option value="">Seleccione una Marca</option>
                  {modelos.map((m) => (
                    <option key={m.id} value={m.nombre}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                <input
                  value={toolTemp.marca}
                  placeholder="Modelo"
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, marca: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <input
                  value={toolTemp.NParte}
                  placeholder="N° Parte"
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, NParte: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <select
                  value={toolTemp.ubicacion}
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, ubicacion: e.target.value })
                  }
                  className="p-2 border rounded"
                >
                  <option value="">Seleccione ubicación</option>
                  {ubicaciones.map((u) => (
                    <option key={u.id} value={u.nombre}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
                <select
                  value={toolTemp.estado}
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, estado: e.target.value })
                  }
                  className="p-2 border rounded"
                >
                  <option value="">Seleccione estado</option>
                  <option value="Disponible">Disponible</option>
                  <option value="En uso">En uso</option>
                </select>
                <select
                  value={toolTemp.calibracion}
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, calibracion: e.target.value })
                  }
                  className="p-2 border rounded"
                >
                  <option value="">Seleccione Calibracion</option>
                  <option value="Calibrada">Calibrada</option>
                  <option value="No calibrada">No calibrada</option>
                  <option value="No necesita">No necesita</option>
                </select>
                <input
                  value={toolTemp.tipo}
                  placeholder="Tipo"
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, tipo: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <input
                  value={toolTemp.observacion}
                  placeholder="Observación"
                  onChange={(e) =>
                    setToolTemp({ ...toolTemp, observacion: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="p-2 border rounded"
                />
              </div>

              <button
                type="button"
                onClick={handleToolSave}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {editingToolIndex !== null
                  ? "Guardar edición"
                  : "Agregar herramienta"}
              </button>

              <table className="min-w-full mt-6 table-auto border border-gray-300 rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Nombre
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Código
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Serie
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Modelo
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Marca
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      N° Parte
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Ubicación
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Calibración
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Imagen
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.herramientas.map((h, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-sm">{h.nombre}</td>
                      <td className="px-4 py-2 text-sm">{h.codigo}</td>
                      <td className="px-4 py-2 text-sm">{h.serie}</td>
                      <td className="px-4 py-2 text-sm">{h.modelo}</td>
                      <td className="px-4 py-2 text-sm">{h.marca}</td>
                      <td className="px-4 py-2 text-sm">{h.NParte}</td>
                      <td className="px-4 py-2 text-sm">{h.ubicacion}</td>
                      <td className="px-4 py-2 text-sm">{h.estado}</td>
                      <td className="px-4 py-2 text-sm">{h.calibracion}</td>
                      <td className="px-4 py-2 text-sm">
                        <a
                          href={h.imagen}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          Ver imagen
                        </a>
                      </td>
                      <td className="px-4 py-2 text-center flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToolEdit(index)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToolDelete(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-center mt-8">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarBodega;
