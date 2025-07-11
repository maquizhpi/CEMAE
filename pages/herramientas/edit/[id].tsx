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
import Router, { useRouter } from "next/router";
import Image from "next/image";


export const EditarHerramienta = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [bodegasDelUsuario, setBodegasDelUsuario] = useState<Bodega[]>([]);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<string>("");
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
    calibracion: "",
    tipo: "",
    cantidad: 1,
    observacion: "",
    imagen: null,
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
 // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadBodegas();
    loadModelos();
    loadUbicaciones();
  }, []);

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (id && bodegasDelUsuario.length > 0) {
      const herramienta = bodegasDelUsuario
        .flatMap(b => b.herramientas ?? [])
        .find(h => h._id === id);

      if (herramienta) {
        setToolTemp(herramienta);

      if (herramienta.imagen) {
        setPreviewImage(herramienta.imagen);}

        const bodega = bodegasDelUsuario.find(b =>
          (b.herramientas ?? []).some(h => h._id === id)
        );

        if (bodega) {
          setBodegaSeleccionada(bodega._id);
        }
      } else {
        toast.error("No se encontró la herramienta");
      }
    }
  }, [id, bodegasDelUsuario]);

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

    const bodega = bodegasDelUsuario.find(b => b._id === bodegaSeleccionada);
    if (!bodega) {
      toast.error("Bodega no encontrada.");
      setLoading(false);
      return;
    }

    const nuevasHerramientas = (bodega.herramientas ?? []).map(h =>
      h._id === id ? { ...toolTemp, imagen: imageUrl } : h
    );

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
      toast.success("Herramienta actualizada correctamente!");
      Router.push("/herramientas");
    } else {
      toast.error("Error al actualizar la herramienta.");
    }

    setLoading(false);
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4 py-8">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
            Editar herramienta
          </h1>
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
              placeholder="Marca"
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
              <option value="">Seleccione Calibración</option>
              <option value="Calibrada">Calibrada</option>
              <option value="No calibrada">No calibrada</option>
              <option value="No necesita">No necesita</option>
            </select>

            <select
              value={toolTemp.tipo}
              onChange={(e) => setToolTemp({ ...toolTemp, tipo: e.target.value })}
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

          </div>
          {/* Vista previa de imagen */}
          <div className="mt-4 text-center">
            <p className="font-bold mb-2 text-gray-700 text-lg">Vista previa de la imagen:</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                    setImage(file); 
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="mt-2"
            />
            <div className="flex justify-center">
              <div className="border-2 border-gray-300 rounded-lg shadow-md overflow-hidden w-60 h-60 bg-white flex items-center justify-center">
                <Image
                  src={
                    previewImage ??
                    "https://firebasestorage.googleapis.com/v0/b/tuProyecto.appspot.com/o/default-placeholder.png?alt=media"
                  }
                  alt="Imagen seleccionada"
                  width={300}
                  height={300}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">

            <Button
              as="button"
              type="button"
              disabled={loading}
              onClick={handleSaveTool}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>

            <Button
              as="button"
              type="button"
              onClick={() => Router.push("/herramientas")}
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

export default EditarHerramienta;
