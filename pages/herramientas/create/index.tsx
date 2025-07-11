/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import {
  Bodega,
  Herramienta,
  ModelosHerramienta,
  Ubicaciones,
  ResponseData,
} from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../controllers/firebase/config";
import Router from "next/router";


export const RegistroHerramientaCreate = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bodegasDelUsuario, setBodegasDelUsuario] = useState<Bodega[]>([]);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<string>("");

  const [toolTemp, setToolTemp] = useState<Herramienta>({
    nombre: "",
    codigo: "",
    descripcion: "",
    serie: "",
    modelo: "",
    marca: "",
    NParte: "",
    ubicacion: "",
    estado: "",
    calibracion: "",
    tipo: "",
    cantidad: 1,
    observacion: "",
    imagen: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [modelos, setModelos] = useState<ModelosHerramienta[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicaciones[]>([]);

  const loadBodegas = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );
    const bodegas = response.data ?? [];
    const bodegasUsuario = bodegas.filter(
      (bodega: Bodega) =>
        bodega.bodegueroAsignado?.identificacion === auth.identificacion
    );

    setBodegasDelUsuario(bodegasUsuario);

    if (bodegasUsuario.length > 0 && !bodegaSeleccionada) {
      setBodegaSeleccionada(bodegasUsuario[0]._id);
    }

    setLoading(false);
  };

  const loadModelos = async () => {
    const response = await HttpClient(
      "/api/modelos",
      "GET",
      auth.usuario,
      auth.rol
    );
    setModelos(response.data ?? []);
  };

  const loadUbicaciones = async () => {
    const response = await HttpClient(
      "/api/ubicaciones",
      "GET",
      auth.usuario,
      auth.rol
    );
    setUbicaciones(response.data ?? []);
  };
 //// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadBodegas();
    loadModelos();
    loadUbicaciones();
  }, []);

  const handleSaveTool = async () => {
    if (!toolTemp.nombre || !toolTemp.codigo) {
      toast.warning("Faltan campos obligatorios (Nombre, Código).");
      return;
    }

    if (!bodegaSeleccionada) {
      toast.warning("Debe seleccionar una bodega.");
      return;
    }

    setLoading(true);

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
        toast.error("Error subiendo imagen");
        setLoading(false);
        return;
      }
    }

    // Buscar la bodega seleccionada
    const bodega = bodegasDelUsuario.find((b) => b._id === bodegaSeleccionada);
    if (!bodega) {
      toast.error("Bodega no encontrada.");
      setLoading(false);
      return;
    }

    const nuevasHerramientas = [...(bodega.herramientas ?? []), { ...toolTemp, imagen: imageUrl }];

    const bodegaActualizada = {
      ...bodega,
      herramientas: nuevasHerramientas,
    };

    const response: ResponseData = await HttpClient(
      "/api/bodegas",
      "PUT",
      auth.usuario,
      auth.rol,
      bodegaActualizada
    );

    if (response.success) {
      toast.success("Herramienta registrada correctamente!");
      setToolTemp({
        nombre: "",
        codigo: "",
        descripcion: "",
        serie: "",
        modelo: "",
        marca: "",
        NParte: "",
        ubicacion: "",
        estado: "",
        calibracion: "",
        tipo: "",
        cantidad: 1,
        observacion: "",
        imagen: "",
      });
      setImage(null);
    } else {
      toast.error("Error al guardar la herramienta.");
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
            Formulario para crear nueva herramientas
          </h1>
          {/* SELECCION DE BODEGA */}
          <div className="mb-4">
            <label className="block text-blue-500 font-bold mb-2">
              Seleccionar Bodega
            </label>
            <select
              value={bodegaSeleccionada}
              onChange={(e) => setBodegaSeleccionada(e.target.value)}
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              {bodegasDelUsuario.map((bodega) => (
                <option key={bodega._id} value={bodega._id}>
                  {bodega.nombreBodega}
                </option>
              ))}
            </select>
          </div>

          {/* FORMULARIO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              value={toolTemp.nombre}
              placeholder="Nombre"
              onChange={(e) => setToolTemp({ ...toolTemp, nombre: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              value={toolTemp.codigo}
              placeholder="Código"
              onChange={(e) => setToolTemp({ ...toolTemp, codigo: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              value={toolTemp.descripcion}
              placeholder="Descripción"
              onChange={(e) => setToolTemp({ ...toolTemp, descripcion: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              value={toolTemp.serie}
              placeholder="Serie"
              onChange={(e) => setToolTemp({ ...toolTemp, serie: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={toolTemp.modelo}
              onChange={(e) => setToolTemp({ ...toolTemp, modelo: e.target.value })}
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
              onChange={(e) => setToolTemp({ ...toolTemp, marca: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              value={toolTemp.NParte}
              placeholder="N° Parte"
              onChange={(e) => setToolTemp({ ...toolTemp, NParte: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={toolTemp.ubicacion}
              onChange={(e) => setToolTemp({ ...toolTemp, ubicacion: e.target.value })}
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
              onChange={(e) => setToolTemp({ ...toolTemp, estado: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Seleccione estado</option>
              <option value="Disponible">Disponible</option>
              <option value="En uso">En uso</option>
            </select>
            <select
              value={toolTemp.calibracion}
              onChange={(e) => setToolTemp({ ...toolTemp, calibracion: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Seleccione Calibracion</option>
              <option value="Calibrada">Calibrada</option>
              <option value="No calibrada">No calibrada</option>
              <option value="No necesita">No necesita</option>
            </select>

            <select
              value={toolTemp.estado}
              onChange={(e) => setToolTemp({ ...toolTemp, estado: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">Seleccione tipo</option>
              <option value="Presicion">Presicion</option>
              <option value="Manual">Manual</option>
              <option value="Especial">Especiales</option>
              <option value="Equipo y maquinas">Equipos y Maquina</option>
            </select>
            <input
              value={toolTemp.observacion}
              placeholder="Observación"
              onChange={(e) => setToolTemp({ ...toolTemp, observacion: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="p-2 border rounded"
            />
          </div>
          <div className="flex justify-between space-x-4">
            <Button
              as="button"
              type="button"
              disabled={loading}
              onClick={handleSaveTool}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              {loading ? "Guardando..." : "Guardar herramienta"}
            </Button>

            <Button
              as="button"
              type="button"
              onClick={() => {
                Router.push("/herramientas"); // o la ruta que corresponda en tu app
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Cancelar
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegistroHerramientaCreate;
