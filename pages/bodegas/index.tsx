import { Button } from "react-bootstrap";
import Sidebar from "../components/sidebar";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useState, useCallback} from "react";
import HttpClient from "../../controllers/utils/http_client";
import { Bodega, Herramienta } from "../../models";
import TreeTable, { ColumnData } from "../components/tree_table";
import { CheckPermissions } from "../../controllers/utils/check_permissions";
import Router from "next/router";
import { generateReporteBodegas } from "../../controllers/utils/reporteBodegas";

export const BodegasPage = () => {
  const { auth } = useAuth();
  const [tableData, setTableData] = useState<Array<Bodega & { creadorNombre: string; bodegueroAsignadoNombre: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>("");


  const loadData = useCallback(async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );
    const bodegas = response.data ?? [];
    const bodegasFiltradas = (auth.rol === 0
      ? bodegas
      : bodegas.filter(
          (bodega) =>
            bodega.bodegueroAsignado?.identificacion === auth?.identificacion
        )
    ).map((bodega) => ({
      ...bodega,
      bodegueroAsignadoNombre: bodega.bodegueroAsignado?.nombre || "N/A",
      creadorNombre: bodega.creador?.nombre || "N/A",
    }));

    setTableData(bodegasFiltradas);
    setLoading(false);
  }, [auth.usuario, auth.rol, auth.identificacion]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const columns: ColumnData[] = [
    {
      dataField: "nombreBodega",
      caption: "Nombre de la bodega",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "bodegueroAsignadoNombre",
      caption: "Bodeguero Asignado",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "creadorNombre",
      caption: "Creador",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "fechaDeCreacion",
      caption: "Fecha de creación",
      alignment: "center",
      cssClass: "bold",
    },
  ];

  const exportToPDF = () => {
  const bodegasFiltradas = tableData.filter((b) =>
    b.nombreBodega?.toLowerCase().includes(filterText.toLowerCase()) ||
    b.bodegueroAsignado?.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
    b.creadorNombre?.toLowerCase().includes(filterText.toLowerCase())
  );

    generateReporteBodegas("REPORTE DE BODEGAS", bodegasFiltradas);
  };

  const buttons = {
    show: (rowData: Herramienta) =>
      CheckPermissions(auth, [0, 1])
        ? Router.push({ pathname: "/bodegas/show/" + (rowData.id as string) })
        : toast.error("No puedes acceder"),
    
    delete: (rowData: Bodega) => {
      if (!CheckPermissions(auth, [0, 1])) {
        toast.error("No tienes permisos para eliminar este registro");
        return;
      }
      if (confirm("¿Estás seguro de que deseas eliminar esta bodega?")) {
        setLoading(true);
        HttpClient(`/api/bodegas/${rowData.id}`, "DELETE", auth.usuario, auth.rol)
          .then(() => {
            toast.success("Registro de bodega eliminado correctamente");
            loadData();
          })
          .catch(() => {
            toast.error("Error al eliminar el registro de calibración");
            setLoading(false);
          });
      }
    },
    edit: (rowData: Bodega) => {
      if (CheckPermissions(auth, [0, 1])) {
        Router.push({ pathname: "/bodegas/editar/" + (rowData.id as string) });
      } else {
        toast.error("No puedes editar bodegas");
      }
    }
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 bg-blue-100">
          <div className="bg-white w-11/12 h-5/6 mx-auto">
            <div className="mt-6">
              <p className="md:text-4xl text-xl text-center pt-5 font-extrabold text-blue-500">
                Todas las bodegas
              </p>
            </div>
            {!CheckPermissions(auth, [2]) && (
              <Button
                className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-blue-900"
                onClick={() =>
                  CheckPermissions(auth, [1,0])
                    ? Router.push({ pathname: "/bodegas/create" })
                    : toast.info("No puede ingresar bodegas")
                }
              >
                Crear bodega
              </Button>
            )}
            <div className="p-2">
              <TreeTable
                keyExpr="id"
                dataSource={tableData}
                buttons={buttons}
                columns={columns}
                searchPanel={true}
                buttonsFirst
                paging
                showNavigationButtons
                showNavigationInfo
                pageSize={10}
                infoText={(actual, total, items) =>
                  `Página ${actual} de ${total} (${items} bodegas)`
                }
              />
            </div>
            <div className="px-8 pb-8">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
                onClick={exportToPDF}
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

export default BodegasPage;
