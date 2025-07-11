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
import { generateReporteSolicitudes } from "./reporte/reporteSolicitudes";


type Props = {
  dates: Array<string>;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  inTabs?: boolean;
};

export const SolicitudePage = (props: Props) => {
  const { auth } = useAuth();
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [filteredData, setFilteredData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/solicitudes",
      "GET",
      auth.usuario,
      auth.rol
    );

    let solicitudes: Array<Solicitude> = response.data ?? [];

    if (auth.rol !== 0) {
      solicitudes = solicitudes.filter(
        (s) =>
          s.bodeguero?.nombre?.toLowerCase() === auth.nombre.toLowerCase() ||
          s.receptor?.nombre?.toLowerCase() === auth.nombre.toLowerCase()
      );
    }

    const solicitudesNormalizadas = solicitudes.map((s) => ({
      ...s,
      receptorNombre: s.receptor?.nombre || "N/A",
      bodegueroNombre: s.bodeguero?.nombre || "N/A",
    }));

    setTableData(solicitudesNormalizadas);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [loading]);

  const columns: ColumnData[] = [
    {
      dataField: "number",
      caption: "Nº Solicitud",
      alignment: "left",
      cssClass: "bold hidden md:table-cell",
      minWidth: 30,
      width: 80,
    },
    {
      dataField: "receptorNombre",
      caption: "Receptor",
      alignment: "left",
      cssClass: "bold table-cell",
      minWidth: 80,
    },
    {
      dataField: "herramientas",
      caption: "Herramientas",
      alignment: "left",
      cssClass: "bold hidden md:table-cell",
      cellRender: (cellData: any) => {
        const herramientas = cellData.value ?? [];
        if (herramientas.length === 0) return "sin herramientas";
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
      cssClass: "bold ",
      minWidth: 80,
      cellRender: (cellData: any) => {
        const estado = cellData.value?.toLowerCase();
        let colorClass = "";
        if (estado === "entregado" || estado === "herramientas entregadas") {
          colorClass = "text-green-600 font-bold";
        } else if (estado === "no entregado") {
          colorClass = "text-red-600 font-bold";
        } else if (estado?.includes("pendiente")) {
          colorClass = "text-yellow-500 font-bold";
        } else {
          colorClass = "text-gray-500 font-bold";
        }
        return <span className={colorClass}>{cellData.value}</span>;
      },
    },
  ];

  const buttons = {
    download: (rowData: Solicitude) =>
      CheckPermissions(auth, [0, 1, 2])
        ? Router.push({
            pathname: "/solicitudes/reporte/" + (rowData.id as string),
          })
        : toast.error("No puedes acceder"),
    edit: (rowData: Solicitude) => {
      if (rowData.estado?.toLowerCase() === "entregado") {
        toast.error("No puedes editar una solicitud con herramientas entregadas");
        return;
      }
      if (!CheckPermissions(auth, [0, 1])) {
        toast.error("No tienes permisos para editar esta solicitud");
        return;
      }
      Router.push({ pathname: "/solicitudes/edit/" + (rowData.id as string) });
    },
        delete: (rowData: Solicitude) => {
          if (!CheckPermissions(auth, [0, 1])) {
            toast.error("No tienes permisos para eliminar este registro");
            return;
          }
          if (confirm("¿Estás seguro de que deseas eliminar este registro de solicitud?")) {
            setLoading(true);
            HttpClient(`/api/solicitudes/${rowData.id}`, 
              "DELETE", 
              auth.usuario, 
              auth.rol)
              .then(() => {
                toast.success("Registro de calibración eliminado correctamente");
                loadData();
              })
              .catch(() => {
                toast.error("Error al eliminar el registro de calibración");
                setLoading(false);
              });
          }
        },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 bg-blue-100">
        <div className="bg-white w-[95%] md:w-5/6 mx-auto mt-4 mb-4 p-4 rounded-lg shadow-md">
          <p className="md:text-4xl text-xl text-center pt-5 font-extrabold text-blue-500 mt-6">
            Registro de solicitudes generadas
          </p>

          {CheckPermissions(auth, [1]) && (
            <Button
              className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-blue-900"
              onClick={() => Router.push({ pathname: "/solicitudes/create" })}
            >
              Crear registro
            </Button>
          )}
      

          <div className="w-full overflow-x-auto px-2">
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
              onFilteredDataChange={(filtered: Solicitude[]) => setFilteredData(filtered)}
            />
          </div>

          <div className="px-8 pb-8">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
              onClick={() =>
                generateReporteSolicitudes("REPORTE DE SOLICITUDES FILTRADAS", filteredData.length > 0 ? filteredData : tableData)
              }
            >
              Exportar reporte PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudePage;
