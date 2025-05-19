import Router from "next/router";
import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { CheckPermissions } from "../../controllers/utils/check_permissions";
import HttpClient from "../../controllers/utils/http_client";
import { Calibracion, Solicitude } from "../../models";
import Sidebar from "../components/sidebar";
import TreeTable, { ColumnData } from "../components/tree_table";

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
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);

    var response = await HttpClient(
      "/api/calibracion",
      "GET",
      auth.usuario,
      auth.rol
    );

    const calibracion: Array<Calibracion> = response.data ?? [];
    console.log(calibracion);
    setTableData(calibracion);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnData[] = [
    {
      dataField: "number",
      caption: "#",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "solicitante",
      caption: "Solicitante",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "fecha",
      caption: "Fecha",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "estado",
      caption: "Estado",
      alignment: "center",
      cssClass: "bold",
    },
  ];

  const buttons = {
    edit: (rowData: Calibracion) => {
      // Verificar si las herramientas ya fueron entregadas
      if (rowData.estado?.toLowerCase() === "herramientas calibradas") {
        toast.error(
          "No puedes editar una solicitud con herramientas calibradas"
        );
        return;
      }

      // Verificar permisos del usuario
      if (!CheckPermissions(auth, [0, 1, 2])) {
        toast.error("No tienes permisos para editar esta solicitud");
        return;
      }

      // Redireccionar a la edición si pasa ambas validaciones
      Router.push({
        pathname: "/calibracion/edit/" + (rowData.id as string),
      });
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
                onClick={() =>
                  CheckPermissions(auth, [0, 1])
                    ? Router.push({ pathname: "/calibracion/create" })
                    : toast.info("No puede ingresar solicitudes")
                }
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
                  `Página ${actual} de ${total} (${items} solicitudes de calibracion)`
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalibracionPage;
