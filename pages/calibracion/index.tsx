import Router from "next/router";
import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { CheckPermissions } from "../../controllers/utils/check_permissions";
import HttpClient from "../../controllers/utils/http_client";
import { Calibracion } from "../../models";
import Sidebar from "../components/sidebar";
import TreeTable, { ColumnData } from "../components/tree_table";
import dayjs from "dayjs";
import { generateReporteCalibraciones } from "./reporte/reporteCalibraciones";

type Props = {
  dates: Array<string>;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  inTabs?: boolean;
};

export const CalibracionPage = (props: Props) => {
  const { auth } = useAuth();
  const [tableData, setTableData] = useState<Array<Calibracion>>([]);
  const [filteredData, setFilteredData] = useState<Array<Calibracion>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/calibracion",
      "GET",
      auth.usuario,
      auth.rol
    );
    const calibracion: Array<Calibracion> = response.data ?? [];
    setTableData(calibracion);
    setLoading(false);
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  }, []);

  const columns: ColumnData[] = [
    {
      dataField: "",
      caption: "#",
      alignment: "center",
      cssClass: "bold",
      cellRender: (params: any) => (params.rowIndex !== undefined ? params.rowIndex + 1 : ""),
    },
    {
      dataField: "herramientas[0].nombre",
      caption: "Herramienta",
      alignment: "center",
      cssClass: "bold",
      cellRender: (cellData: any) => cellData.value?.toUpperCase() ?? "",
    },
    {
      dataField: "herramientas[0].serie",
      caption: "Número de Serie",
      alignment: "center",
      cssClass: "bold",
      cellRender: (cellData: any) => cellData.value?.toUpperCase() ?? "",
    },
    {
      dataField: "fechaCalibracion",
      caption: "Fecha Calibración",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "fechaProximaCalibracion",
      caption: "Fecha Próxima Calibración",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "empresaDeCalibracion",
      caption: "Empresa",
      alignment: "center",
      cssClass: "bold",   
    },
    {
      dataField: "documentoCalibracion",
      caption: "Documento",
      alignment: "center",
      cssClass: "bold",
      cellRender: (cellData: any) => {
        return cellData.value && cellData.value.trim() !== "" ? (
          <a
            href={cellData.value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg"
          >
            Ver documento
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-block bg-gray-400 text-white font-bold py-1 px-3 rounded-lg cursor-not-allowed"
          >
            Sin documento
          </button>
        );
      },
    },
    {
      dataField: "estado",
      caption: "Estado",
      alignment: "center",
      cssClass: "bold",
      cellRender: (cellData: any) => {
        const rowData = cellData.data;
        const estado = cellData.value;
        const hoy = dayjs();
        const fechaProxima = dayjs(rowData.fechaProximaCalibracion);
        const estaVencido = fechaProxima.isBefore(hoy, "day");

        if (estaVencido) {
          return (
            <span className="inline-block bg-red-600 text-white font-bold py-1 px-3 rounded-lg">
              VENCIDO
            </span>
          );
        }
        if (estado === "Herramientas calibradas") {
          return (
            <span className="inline-block bg-green-500 text-white font-bold py-1 px-3 rounded-lg">
              {estado}
            </span>
          );
        } else if (estado === "En calibracion") {
          return (
            <span className="inline-block bg-yellow-300 text-black font-bold py-1 px-3 rounded-lg">
              {estado}
            </span>
          );
        } else {
          return (
            <span className="inline-block bg-gray-200 text-black font-bold py-1 px-3 rounded-lg">
              {estado}
            </span>
          );
        }
      },
    },
  ];

  const buttons = {
    
    edit: (rowData: Calibracion) => {
      if (!CheckPermissions(auth, [0, 1])) {
        toast.error("No tienes permisos para editar esta solicitud");
        return;
      }
      Router.push({ pathname: "/calibracion/edit/" + rowData.id });
    },
    show: (rowData: Calibracion) => {
      Router.push({ pathname: '/calibracion/reporte/reporteCalibracionIndividual', query: { id: rowData.id } });

    },
    delete: (rowData: Calibracion) => {
      if (!CheckPermissions(auth, [0, 1])) {
        toast.error("No tienes permisos para eliminar este registro");
        return;
      }
      if (confirm("¿Estás seguro de que deseas eliminar este registro de calibración?")) {
        setLoading(true);
        HttpClient(`/api/calibracion/${rowData.id}`, "DELETE", auth.usuario, auth.rol)
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
    <>
      <div className="flex h-screen">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 bg-blue-100">
          <div className="bg-white w-5/6 h-5/6 mx-auto">
            <div className="mt-6">
              <p className="md:text-4xl text-xl text-center pt-5 font-extrabold text-blue-500">
                Registro de herramientas calibradas
              </p>
            </div>
            {CheckPermissions(auth, [0, 1]) && (
              <Button
                className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-blue-900"
                onClick={() => Router.push({ pathname: "/calibracion/create" })}
              >
                Crear registro
              </Button>
            )}
            <div className="p-2">
              <TreeTable
                keyExpr="id"
                dataSource={tableData}
                columns={columns}
                searchPanel={true}
                buttons={buttons}
                colors={{ headerBackground: "#F8F9F9", headerColor: "#466cf2" }}
                buttonsFirst
                paging
                showNavigationButtons
                showNavigationInfo
                pageSize={10}
                infoText={(actual, total, items) =>
                  `Página ${actual} de ${total} (${items} solicitudes de calibración)`
                }
                onFilteredDataChange={(filtered: Calibracion[]) => setFilteredData(filtered)}
              />
            </div>
            <div className="px-8 pb-8">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
                onClick={() =>
                  generateReporteCalibraciones(
                    "REPORTE DE CALIBRACIONES FILTRADAS",
                    filteredData
                  )
                }
              >
                Exportar reporte PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalibracionPage;
