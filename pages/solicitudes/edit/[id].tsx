/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../../controllers/hooks/use_auth";
import { useFormik } from "formik";
import Router from "next/router";
import { toast } from "react-toastify";
import { Herramienta, ResponseData, Bodega } from "../../../models";
import HttpClient from "../../../controllers/utils/http_client";
import { useEffect, useState } from "react";

// Tipo extendido para incluir estado de entrega y estado actual de la herramienta
type HerramientaConEntrega = Herramienta & {
  entregada?: boolean;
  estadoActual?: string;
};

export const EditarRegistro = () => {
  const { auth } = useAuth(); // Hook de autenticación
  const [loading, setLoading] = useState(false); // Estado de carga
  const [initialValues, setInitialValues] = useState(null); // Valores iniciales del formulario
  const [bodegas, setBodegas] = useState<Bodega[]>([]); // Lista de bodegas

  // Función para cargar los datos de la solicitud y las bodegas
  const loadData = async () => {
    try {
      setLoading(true);
      const solicitudeId = Router.query.id as string; // Obtener el id de la solicitud desde la URL
      // Obtener datos de la solicitud
      const response = await HttpClient(
        `/api/solicitudes/${solicitudeId}`, 
        "GET", 
        auth.usuario, 
        auth.rol);

      const solicitud = response.data;
      const herramientasSolicitud = Array.isArray(solicitud.herramientas) ? solicitud.herramientas : [];

      // Obtener datos de las bodegas
      const bodegasResponse = await HttpClient(
        "/api/bodegas", 
        "GET", 
        auth.usuario, 
        auth.rol);

      const bodegasData: Bodega[] = bodegasResponse.data ?? [];
      setBodegas(bodegasData);

      // Actualizar estado de cada herramienta según su estado en la bodega
      const herramientasActualizadas = herramientasSolicitud.map((h: HerramientaConEntrega) => {
        let estadoActual = "No encontrada";

        for (const bodega of bodegasData) {
          const herramienta = bodega.herramientas?.find(item => item.nombre === h.nombre && item.codigo === h.codigo);
          if (herramienta) {
            estadoActual = herramienta.estado;
            break;
          }
        }

        return {
          ...h,
          entregada: estadoActual === "En uso",
          estadoActual
        };
      });

      // Establecer valores iniciales para el formulario
      setInitialValues({
        ...solicitud,
        herramientas: herramientasActualizadas,
        observacion: solicitud.observacion || ""
      });
    } catch (error) {
      console.error("Error cargando la solicitud:", error);
      toast.error("Error cargando los datos de la solicitud.");
    } finally {
      setLoading(false);
    }
  };
  // Cargar datos cuando cambie el id de la solicitud en la URL
  useEffect(() => {
    if (Router.query.id) loadData();
  }, [Router.query.id]);

  // Configuración de Formik para el formulario
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
    
    onSubmit: async (values) => {
      setLoading(true);

      // Calcular cuántas herramientas fueron entregadas
      const entregadas = values.herramientas.filter(
        h => h.estadoActual === "Disponible" || h.entregada !== false).length;
      
        // Actualizar estado de la solicitud según herramientas entregadas
      values.estado = entregadas === values.herramientas.length ? "ENTREGADO" : "PENDIENTE";
      
      // Actualizar estado de entrega de cada herramienta
      values.herramientas = values.herramientas.map(h => ({ ...h, entregada: h.entregada !== false }));

      // Actualizar la solicitud en el backend
      const response: ResponseData = await HttpClient("/api/solicitudes", "PUT", auth.usuario, auth.rol, values);

      if (response.success) {
        try {
          // Agrupar herramientas por bodega para actualizar su estado
          const actualizacionesPorBodega = {};

          for (const herramienta of values.herramientas.filter(h => h.entregada !== false)) {
            const bodegaCorrecta = bodegas.find(b =>
              b.herramientas?.some(hb => hb.nombre === herramienta.nombre && hb.codigo === herramienta.codigo)
            );

            if (bodegaCorrecta) {
              const indice = bodegaCorrecta.herramientas.findIndex(
                hb => hb.nombre === herramienta.nombre && hb.codigo === herramienta.codigo
              );
              if (indice !== -1) {
                if (!actualizacionesPorBodega[bodegaCorrecta.id]) {
                  actualizacionesPorBodega[bodegaCorrecta.id] = { bodega: bodegaCorrecta, herramientasActualizar: [] };
                }
                actualizacionesPorBodega[bodegaCorrecta.id].herramientasActualizar.push({ indice });
              }
            }
          }

          // Actualizar el estado de las herramientas en cada bodega
          await Promise.all(
            Object.values(actualizacionesPorBodega).map(async ({ bodega, herramientasActualizar }) => {
              const herramientasActualizadas = [...bodega.herramientas];
              for (const { indice } of herramientasActualizar) {
                herramientasActualizadas[indice] = {
                  ...herramientasActualizadas[indice],
                  estado: "Disponible"
                };
              }
              const bodegaActualizada = { ...bodega, herramientas: herramientasActualizadas };
              return HttpClient(
                "/api/bodegas/"
                , "PUT", 
                auth.usuario, 
                auth.rol, 
                bodegaActualizada);
            })
          );

          toast.success("Entrega registrada correctamente.");
          Router.back(); // Volver a la página anterior
        } catch (error) {
          console.error("Error al actualizar herramientas:", error);
          toast.warning("Entrega registrada, pero falló la actualización de herramientas.");
        }
      } else {
        toast.warning(response.message);
      }

      setLoading(false);
    }
  });

  // Renderizado del formulario y la interfaz
  return (
    <div className="flex h-screen">
      {/* Sidebar de navegación */}
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      {/* Contenido principal */}
      <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
        <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">Editar registro de herramientas prestadas</h1>
          <form onSubmit={formik.handleSubmit}>
            {/* Campo Bodeguero */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Bodeguero</label>
              <input type="text" value={formik.values.bodeguero.nombre} className="border p-2 w-full rounded-lg" disabled />
            </div>
            {/* Campo Receptor */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Receptor</label>
              <input type="text" value={formik.values.receptor.nombre} className="border p-2 w-full rounded-lg" disabled />
            </div>
            {/* Campo Fecha */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Fecha</label>
              <input type="text" value={formik.values.fecha} className="border p-2 w-full bg-gray-200 rounded-lg" disabled />
            </div>
            {/* Campo Observación */}
            <div className="mb-4">
              <label className="block text-blue-500 font-bold mb-2">Observación</label>
              <textarea name="observacion" value={formik.values.observacion} onChange={formik.handleChange} className="border p-2 w-full rounded-lg" rows={3} placeholder="Ejemplo: Faltó herramienta por daño, cliente firmó sin recibir completa." />
            </div>
            {/* Listado de herramientas */}
            <div className="mb-4">
              <p className="text-xl font-bold text-blue-500 mb-2">Herramientas agregadas</p>
              {formik.values.herramientas.length === 0 ? (
                <p className="text-gray-500">No hay herramientas agregadas.</p>
              ) : (
                <ul className="border rounded-lg p-3 bg-gray-50">
                  {formik.values.herramientas.map((tool, index) => (
                    <li key={index} className={`flex justify-between items-center border-b last:border-b-0 p-2 ${tool.entregada === false ? "bg-red-100" : ""}`}>
                      <span>{tool.nombre} - {tool.marca} - {tool.ubicacion} - {tool.serie}</span>
                      {/* Botón para marcar como entregada o no entregada */}
                      <Button
                        className={`font-bold py-1 px-3 rounded-lg text-white ${
                          tool.estadoActual === "Disponible" ? "bg-yellow-500 cursor-not-allowed" :
                          tool.entregada === false ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                        }`}
                        size="sm"
                        onClick={() => {
                          if (tool.estadoActual === "Disponible") return;
                          const updatedTools = [...formik.values.herramientas];
                          updatedTools[index] = {
                            ...updatedTools[index],
                            entregada: !(tool.entregada !== false)
                          };
                          formik.setFieldValue("herramientas", updatedTools);
                        }}
                        disabled={tool.estadoActual === "Disponible"}
                      >
                        {tool.estadoActual === "Disponible" ? "Entregada" : tool.entregada === false ? "No entrega" : "Entregar"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Botón para registrar la entrega */}
          <div className="flex justify-between space-x-4">
            <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full">
              {loading ? "Registrando..." : "Registrar entrega"}
            </Button>

            <Button
              as="button"
              type="button"
              onClick={() => {
                Router.push("/solicitudes");
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

export default EditarRegistro;