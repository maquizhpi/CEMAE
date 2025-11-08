/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import { Herramienta, ResponseData, Bodega } from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Select from "react-select";

type HerramientaConEntrega = Herramienta & {
  entregada?: boolean;     // si se registrará como entregada en este recibo
  estadoActual?: string;   // estado leído de la bodega
};

export const EditarRegistro = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);

  const [initialValues, setInitialValues] = useState<any>(null);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);

  // Inventario de herramientas disponibles para agregar
  const [disponibles, setDisponibles] = useState<Herramienta[]>([]);
  const [selectedTool, setSelectedTool] = useState<any>(null);

  // Helper para identificar herramienta (usa id si existe, sino nombre+codigo)
  const sameTool = (a: Partial<Herramienta>, b: Partial<Herramienta>) => {
    if (a.id && b.id) return a.id === b.id;
    return a.nombre === b.nombre && a.codigo === b.codigo;
  };

  // Cargar solicitud + bodegas
  const router = useRouter();
  const id = router.query.id as string;

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);

      // 1) Solicitud
      const response = await HttpClient(`/api/solicitudes/${id}`, "GET", auth.usuario, auth.rol);
      const solicitud = response.data;
      const herramientasSolicitud = Array.isArray(solicitud.herramientas) ? solicitud.herramientas : [];

      // 2) Bodegas
      const bodegasResponse = await HttpClient("/api/bodegas", "GET", auth.usuario, auth.rol);
      const bodegasData: Bodega[] = bodegasResponse.data ?? [];
      setBodegas(bodegasData);

      // 3) Estado actual de cada herramienta del recibo (en bodega)
      const herramientasActualizadas = herramientasSolicitud.map((h: HerramientaConEntrega) => {
        let estadoActual = "No encontrada";
        for (const bodega of bodegasData) {
          const herramienta = bodega.herramientas?.find(
            item => item.nombre === h.nombre && item.codigo === h.codigo
          );
          if (herramienta) {
            estadoActual = herramienta.estado;
            break;
          }
        }
        // en tu UI, "entregada" se interpreta como marcada para entregar
        return { ...h, entregada: estadoActual === "En uso", estadoActual };
      });

      // 4) Herramientas disponibles (para poder agregarlas al recibo)
      const allDisponibles = bodegasData
        .flatMap(b => b.herramientas ?? [])
        .filter(h => h.estado === "Disponible");
      setDisponibles(allDisponibles);

      // 5) Inicializar formik
      setInitialValues({
        ...solicitud,
        herramientas: herramientasActualizadas,
        observacion: solicitud.observacion || "",
      });
    } catch (error) {
      console.error("Error cargando la solicitud:", error);
      toast.error("Error cargando los datos de la solicitud.");
    } finally {
      setLoading(false);
    }
  }, [auth.usuario, auth.rol, id]);

  useEffect(() => {
    if (id) loadData();
  }, [id, loadData]);

  // Opciones del selector (evita duplicados ya agregados al recibo)
  const toolOptions = useMemo(() => {
    if (!initialValues) return [];
    const actuales = initialValues?.herramientas ?? [];
    const disponiblesFiltradas = disponibles.filter(
      d => !actuales.some((h: Herramienta) => sameTool(h, d))
    );
    return disponiblesFiltradas.map(tool => ({
      value: tool.id ?? `${tool.nombre}-${tool.codigo}`,
      label: `${tool.nombre} — ${tool.codigo} — ${tool.modelo ?? ""} — ${tool.marca ?? ""} — ${tool.ubicacion ?? ""} — ${tool.serie ?? ""}`.replace(/\s—\s$/, "")
    }));
  }, [disponibles, initialValues]);

  // Agregar herramienta: se agrega como NO entregada (queda PENDIENTE hasta "Registrar entrega")
  const addHerramienta = () => {
    if (!selectedTool || !initialValues) return;
    const toolObj = disponibles.find(t => (t.id ?? `${t.nombre}-${t.codigo}`) === selectedTool.value);
    if (!toolObj) return;

    const agregada: HerramientaConEntrega = {
      ...toolObj,
      entregada: false,            // importante para que no pase a ENTREGADO por accidente
      estadoActual: "Disponible"   // está disponible en bodega hasta que registres entrega
    };

    const nuevas = [...(initialValues.herramientas ?? []), agregada];
    setInitialValues((prev: any) => ({ ...prev, herramientas: nuevas }));
    setSelectedTool(null);
  };

  // Quitar herramienta del recibo
  const removeHerramienta = (index: number) => {
    if (!initialValues) return;
    const nuevas = initialValues.herramientas.filter((_: any, i: number) => i !== index);
    setInitialValues((prev: any) => ({ ...prev, herramientas: nuevas }));
  };

  // Formik (no usamos onSubmit; tenemos 2 acciones separadas abajo)
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues || {
      number: 0,
      herramientas: [],
      fecha: "",
      bodeguero: { nombre: "", identificacion: "", telefono: "", correo: "" },
      receptor: { nombre: "", identificacion: "", telefono: "", correo: "" },
      estado: "",
      observacion: ""
    },
    onSubmit: () => {}
  });

  // 1 ) ACTUALIZAR (sin entregar): cambia Disponibles -> En uso en bodega,
  // mantiene la solicitud en PENDIENTE y NO marca 'entregada' en el recibo.
  const handleActualizar = async () => {
    if (!initialValues) return;
    setLoading(true);
    try {
      const values = { ...formik.values };

      // Herramientas recién agregadas (en bodega aún "Disponible")
      const nuevasPendientes = values.herramientas.filter(
        (h: HerramientaConEntrega) => h.estadoActual === "Disponible"
      );

      // --- 1) Actualizar Bodegas: Disponible -> En uso ---
      if (nuevasPendientes.length > 0) {
        const actualizacionesPorBodega: Record<
          string,
          { bodega: Bodega; herramientasActualizar: { indice: number }[] }
        > = {};

        for (const herramienta of nuevasPendientes) {
          const bodegaCorrecta = bodegas.find(b =>
            b.herramientas?.some(hb => sameTool(hb, herramienta))
          );
          if (!bodegaCorrecta) continue;

          const indice = bodegaCorrecta.herramientas!.findIndex(hb => sameTool(hb, herramienta));
          if (indice === -1) continue;

          if (!actualizacionesPorBodega[bodegaCorrecta.id as string]) {
            actualizacionesPorBodega[bodegaCorrecta.id as string] = { bodega: bodegaCorrecta, herramientasActualizar: [] };
          }
          actualizacionesPorBodega[bodegaCorrecta.id as string].herramientasActualizar.push({ indice });
        }

        await Promise.all(
          Object.values(actualizacionesPorBodega).map(async ({ bodega, herramientasActualizar }) => {
            const herramientasActualizadas = [...(bodega.herramientas ?? [])];
            for (const { indice } of herramientasActualizar) {
              herramientasActualizadas[indice] = {
                ...herramientasActualizadas[indice],
                estado: "En uso", // <- aquí el cambio
              };
            }
            const bodegaActualizada = { ...bodega, herramientas: herramientasActualizadas };
            return HttpClient("/api/bodegas/", "PUT", auth.usuario, auth.rol, bodegaActualizada);
          })
        );
      }

      // --- 2) Actualizar solicitud (forzar PENDIENTE) ---
      values.estado = "PENDIENTE";
      const resp: ResponseData = await HttpClient("/api/solicitudes", "PUT", auth.usuario, auth.rol, values);
      if (!resp.success) return toast.warning(resp.message || "No se pudo actualizar el recibo.");

      // --- 3) Refrescar UI local: poner estadoActual="En uso" a las que movimos, PERO mantener entregada=false ---
      const herramientasRefrescadas = values.herramientas.map((h: HerramientaConEntrega) =>
        h.estadoActual === "Disponible" ? { ...h, estadoActual: "En uso", entregada: false } : h
      );
      setInitialValues((prev: any) => ({ ...prev, herramientas: herramientasRefrescadas, estado: "PENDIENTE" }));

      toast.success("Recibo actualizado");
      Router.push("/solicitudes");

    } catch (e) {
      console.error(e);
      toast.error("Error al actualizar el recibo.");
    } finally {
      setLoading(false);
    }
  };


  // 2) REGISTRAR ENTREGA: calcula ENTREGADO/PENDIENTE y actualiza bodegas (las entregadas -> En uso)
  // REGISTRAR ENTREGA: asegura En uso en bodega para las marcadas como entregadas
  // y calcula ENTREGADO solo si TODAS están entregadas.
  const handleRegistrarEntrega = async () => {
    if (!initialValues) return;
    setLoading(true);
    try {
      const values = { ...formik.values };

      // Herramientas que el usuario marcó como entregadas en el recibo
      const aEntregar = values.herramientas.filter(
        (h: HerramientaConEntrega) => h.entregada !== false
      );

      // --- 1) Actualizar Bodegas (idempotente): poner En uso las marcadas ---
      if (aEntregar.length > 0) {
        const actualizacionesPorBodega: Record<
          string,
          { bodega: Bodega; herramientasActualizar: { indice: number }[] }
        > = {};

        for (const herramienta of aEntregar) {
          const bodegaCorrecta = bodegas.find(b =>
            b.herramientas?.some(hb => sameTool(hb, herramienta))
          );
          if (!bodegaCorrecta) continue;

          const indice = bodegaCorrecta.herramientas!.findIndex(hb => sameTool(hb, herramienta));
          if (indice === -1) continue;

          if (!actualizacionesPorBodega[bodegaCorrecta.id as string]) {
            actualizacionesPorBodega[bodegaCorrecta.id as string] = { bodega: bodegaCorrecta, herramientasActualizar: [] };
          }
          actualizacionesPorBodega[bodegaCorrecta.id as string].herramientasActualizar.push({ indice });
        }

        await Promise.all(
          Object.values(actualizacionesPorBodega).map(async ({ bodega, herramientasActualizar }) => {
            const herramientasActualizadas = [...(bodega.herramientas ?? [])];
            for (const { indice } of herramientasActualizar) {
              herramientasActualizadas[indice] = {
                ...herramientasActualizadas[indice],
                estado: "Disponible", // reafirmamos "En uso" al registrar entrega
              };
            }
            const bodegaActualizada = { ...bodega, herramientas: herramientasActualizadas };
            return HttpClient("/api/bodegas/", "PUT", auth.usuario, auth.rol, bodegaActualizada);
          })
        );
      }

      // --- 2) Estado de la solicitud: ENTREGADO si todas están entregadas, sino PENDIENTE ---
      const todasEntregadas = values.herramientas.every(
        (h: HerramientaConEntrega) => h.entregada !== false
      );
      values.estado = todasEntregadas ? "ENTREGADO" : "PENDIENTE";

      // Persistir solicitud
      const response: ResponseData = await HttpClient("/api/solicitudes", "PUT", auth.usuario, auth.rol, values);
      if (!response.success) return toast.warning(response.message || "No se pudo registrar la entrega.");

      toast.success(todasEntregadas ? "Entrega registrada. Recibo ENTREGADO." : "Entrega parcial registrada. Recibo PENDIENTE.");
      Router.back();
    } catch (error) {
      console.error(error);
      toast.warning("Se guardó la solicitud, pero falló la actualización de herramientas.");
    } finally {
      setLoading(false);
    }
  };


  // UI
  return (
    <div className="flex h-screen">
      {/* Sidebar de navegación */}
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
            Editar registro de herramientas prestadas
          </h1>

          <form onSubmit={formik.handleSubmit}>
            {/* Cabecera */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Bodeguero</label>
              <input type="text" value={formik.values.bodeguero.nombre} className="border p-2 w-full rounded-lg" disabled />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Receptor</label>
              <input type="text" value={formik.values.receptor.nombre} className="border p-2 w-full rounded-lg" disabled />
            </div>
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Fecha</label>
              <input type="text" value={formik.values.fecha} className="border p-2 w-full bg-gray-200 rounded-lg" disabled />
            </div>

            {/* Observación */}
            <div className="mb-6">
              <label className="block text-blue-500 font-bold mb-2">Observación</label>
              <textarea
                name="observacion"
                value={formik.values.observacion}
                onChange={formik.handleChange}
                className="border p-2 w-full rounded-lg"
                rows={3}
                placeholder="Ej.: Se agregaron nuevas herramientas; quedan pendientes de entrega."
              />
            </div>

            {/* Agregar herramientas disponibles */}
            <div className="mb-6">
              <p className="text-xl font-bold text-blue-500 mb-2">Agregar herramientas (Disponibles)</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    options={toolOptions}
                    value={selectedTool}
                    onChange={setSelectedTool}
                    placeholder="Selecciona una herramienta disponible"
                    isDisabled={loading || toolOptions.length === 0}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addHerramienta}
                  disabled={loading || !selectedTool}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Agregar
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                * Solo se listan herramientas con estado <b>“Disponible”</b> y que aún no estén en este recibo.
              </p>
            </div>

            {/* Listado de herramientas en el recibo */}
            <div className="mb-6">
              <p className="text-xl font-bold text-blue-500 mb-2">Herramientas en el recibo</p>
              {formik.values.herramientas.length === 0 ? (
                <p className="text-gray-500">No hay herramientas agregadas.</p>
              ) : (
                <ul className="border rounded-lg p-3 bg-gray-50 divide-y">
                  {formik.values.herramientas.map((tool: HerramientaConEntrega, index: number) => (
                    <li key={`${tool.id ?? tool.codigo}-${index}`} className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-2 ${tool.entregada === false ? "bg-red-100" : ""}`}>
                      <div className="text-sm">
                        <span className="font-semibold">{tool.nombre}</span>{" "}
                        <span className="text-gray-600">
                          — Código: {tool.codigo} — Modelo: {tool.modelo ?? "-"} — Marca: {tool.marca ?? "-"} — Serie: {tool.serie ?? "-"} — Ubicación: {tool.ubicacion ?? "-"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {/* Marcar como Entregar / No entrega (solo si no está fija como Disponible) */}
                        <Button
                          className={`font-bold py-1 px-3 rounded-lg text-white ${
                            tool.estadoActual === "Disponible" ? "bg-yellow-500 cursor-not-allowed" :
                            tool.entregada === false ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                          }`}
                          size="sm"
                          onClick={() => {
                            if (tool.estadoActual === "Disponible") return; // nuevas quedan como pendientes hasta registrar entrega
                            const updatedTools = [...formik.values.herramientas];
                            updatedTools[index] = {
                              ...updatedTools[index],
                              entregada: !(tool.entregada !== false)
                            };
                            formik.setFieldValue("herramientas", updatedTools);
                          }}
                          disabled={tool.estadoActual === "Disponible"}
                        >
                          {tool.estadoActual === "Disponible" ? "Pendiente" : tool.entregada === false ? "No entrega" : "Entregar"}
                        </Button>

                        {/* Quitar del recibo */}
                        <Button
                          type="button"
                          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-lg"
                          size="sm"
                          onClick={() => removeHerramienta(index)}
                        >
                          Quitar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Guardar sin entregar */}
              <Button
                type="button"
                disabled={loading}
                onClick={handleActualizar}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
              >
                {loading ? "Actualizando..." : "ACTUALIZAR"}
              </Button>

              {/* Registrar entrega */}
              <Button
                type="button"
                disabled={loading}
                onClick={handleRegistrarEntrega}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
              >
                {loading ? "Registrando..." : "ENTREGAR"}
              </Button>

              <Button
                as="button"
                type="button"
                onClick={() => Router.push("/solicitudes")}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg w-full"
              >
                CANCELAR
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarRegistro;
