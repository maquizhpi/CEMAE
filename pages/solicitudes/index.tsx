/* eslint-disable react/no-unescaped-entities */
import { Button } from "react-bootstrap";
import Sidebar from "../components/sidebar";
import { CheckPermissions } from "../../controllers/utils/check_permissions";
import Router from "next/router";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useState } from "react";
import HttpClient from "../../controllers/utils/http_client";
import { Solicitude } from "../../models";
import TreeTable, { ColumnData } from "../components/tree_table";

// Definición de las props que recibe el componente
type Props = {
  dates: Array<string>;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  inTabs?: boolean;
};

// Componente principal de la página de solicitudes
export const SolicitudePage = (props: Props) => {
  const { auth } = useAuth(); // Hook de autenticación
  const [tableData, setTableData] = useState<Array<Solicitude>>([]); // Estado para los datos de la tabla
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga

  // Función para cargar los datos de las solicitudes
  const loadData = async () => {
    setLoading(true);

    // Llamada al backend para obtener las solicitudes
    var response = await HttpClient(
      "/api/solicitudes",
      "GET",
      auth.usuario,
      auth.rol
    );

    const solicitudes: Array<Solicitude> = response.data ?? [];
    
    // Filtra las solicitudes según el usuario autenticado
    const bodegasDelUsuario = solicitudes.filter(
      (bodega) =>
        bodega.bodeguero?.nombre?.toLowerCase() === auth.nombre.toLowerCase() ||
        bodega.receptor?.nombre?.toLowerCase() === auth.nombre.toLowerCase()
    );

    console.log(bodegasDelUsuario);
    setTableData(bodegasDelUsuario); // Actualiza el estado con las solicitudes filtradas
    setLoading(false);
  };

  // Carga los datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Definición de las columnas de la tabla
  const columns: ColumnData[] = [
    {
      dataField: "receptor",
      caption: "Receptor",
      alignment: "left",
      cssClass: "bold",
      cellRender: (cellData: any) => cellData.value?.nombre || "N/A",
      
    },
    {
      dataField: "herramientas",
      caption: "Herramientas",
      alignment: "left",
      cssClass: "bold",
      cellRender: (cellData: any) => {
        const herramientas = cellData.value ?? [];
        if (herramientas.length === 0) {
          return "sin herramientas";
        }
        return (
          <ul>
            {herramientas.map((h: any, index: number) => (
              <li key={index}>{h.nombre?.toUpperCase()}</li>
            ))}
          </ul>
        );
      },
    },

    {
      dataField: "estado",
      caption: "Estado",
      alignment: "left",
      cssClass: "bold",
      cellRender: (cellData: any) => {
        const estado = cellData.value?.toLowerCase();

        let colorClass = "";
        // Asigna color según el estado
        if (estado === "entregado" || estado === "herramientas entregadas") {
          colorClass = "text-green-600 font-bold";
        } else if (estado === "no entregado") {
          colorClass = "text-red-600 font-bold";
        } else if (estado.includes("pendiente")) {
          colorClass = "text-yellow-500 font-bold";
        } else {
          colorClass = "text-gray-500 font-bold";
        }

        return <span className={colorClass}>{cellData.value}</span>;
      },
    },
  ];

  // Definición de los botones de acción de la tabla
  const buttons = {
    // Botón para descargar reporte
    download: (rowData: Solicitude) =>
      CheckPermissions(auth, [0, 1, 2])
        ? Router.push({
            pathname: "/solicitudes/reporte/" + (rowData.id as string),
          })
        : toast.error("No puedes acceder"),
    // Botón para editar solicitud
    edit: (rowData: Solicitude) => {
      // Verifica si las herramientas ya fueron entregadas
      if (rowData.estado?.toLowerCase() === "entregado") {
        toast.error(
          "No puedes editar una solicitud con herramientas entregadas"
        );
        return;
      }

      // Verifica permisos del usuario
      if (!CheckPermissions(auth, [0, 1])) {
        toast.error("No tienes permisos para editar esta solicitud");
        return;
      }

      // Redirecciona a la edición si pasa ambas validaciones
      Router.push({
        pathname: "/solicitudes/edit/" + (rowData.id as string),
      });
    },
  };

  // Renderizado del componente
  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar de navegación */}
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        {/* Contenido principal */}
        <div className="w-12/12 md:w-5/6 bg-blue-100">
          <div className="bg-white w-5/6 h-5/6 mx-auto">
            <div className="mt-6">
              <p className="md:text-4xl text-xl text-center pt-5 font-extrabold text-blue-500">
                Registro de solicitudes generadas
              </p>
            </div>
            {/* Botón para crear registro (solo para ciertos roles) */}
            {CheckPermissions(auth, [1]) && (
              <Button
                className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-blue-900"
                onClick={() =>
                  CheckPermissions(auth, [1])
                    ? Router.push({ pathname: "/solicitudes/create" })
                    : toast.info("No puede ingresar solicitudes")
                }
              >
                Crear registro
              </Button>
            )}
            {/* Botón para crear registro como cliente (en desarrollo) */}
            {CheckPermissions(auth, []) && (
              <Button
                className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-blue-900"
                onClick={() =>
                  CheckPermissions(auth, [2])
                    ? Router.push({ pathname: "/solicitudes/createForClient" })
                    : toast.info("No puede ingresar solicitudes")
                }
              >
                Crear registro
              </Button>
            )}
            {CheckPermissions(auth, [0]) && (
            <Button
              className="text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-gray-900"
              onClick={async () => {
                setLoading(true);
                // Llama a la API y muestra todas las solicitudes sin filtrar por usuario
                const response = await HttpClient(
                  "/api/solicitudes",
                  "GET",
                  auth.usuario,
                  auth.rol
                );
                const solicitudes: Array<Solicitude> = response.data ?? [];
                setTableData(solicitudes);
                setLoading(false);
              }}
            >
              Mostrar todas las solicitudes
            </Button>
            )}
            {/* Tabla de solicitudes */}
            <div className="p-2">
              <TreeTable
                keyExpr="id"
                dataSource={tableData}
                columns={columns}
                searchPanel={true}
                buttons={buttons}
                buttonsFirst
                paging
                showNavigationButtons
                showNavigationInfo
                pageSize={10}
                infoText={(actual, total, items) =>
                  `Página ${actual} de ${total} (${items} solicitudes)`
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolicitudePage;
