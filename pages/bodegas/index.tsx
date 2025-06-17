import { Button } from "react-bootstrap";
import Sidebar from "../components/sidebar";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useRef, useState } from "react";
import HttpClient from "../../controllers/utils/http_client";
import { Bodega, Herramienta } from "../../models";
import TreeTable, { ColumnData } from "../components/tree_table";
import ConfirmModal from "../components/modals/confirm";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { CheckPermissions } from "../../controllers/utils/check_permissions";
import Router from "next/router";

export const BodegasPage = () => {
  const { auth } = useAuth();
  const [tableData, setTableData] = useState<Array<Bodega>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemToDelete, setItemToDelete] = useState<string>(null);
  const excelExporter = useRef<ExcelExport>(null);

  // Cargar datos de bodegas
  const loadData = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );
    const bodegas = response.data ?? [];

    // Si el rol es 0, mostrar todas las bodegas
    const bodegasFiltradas =
      auth.rol === 0
        ? bodegas
        : bodegas.filter(
            (bodega) =>
              bodega.bodegueroAsignado.toLowerCase() ===
              auth.usuario.toLowerCase()
          );

    setTableData(bodegasFiltradas);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: ColumnData[] = [
    {
      dataField: "nombreBodega",
      caption: "Nombre de la bodega",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "bodegueroAsignado",
      caption: "Bodeguero Asignado",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "creador",
      caption: "Creador",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "fechaDeCreacion",
      caption: "Fecha de creacion ",
      alignment: "center",
      cssClass: "bold",
    },
  ];

  // Exportar a Excel
  const exportToExcel = () => {
    if (excelExporter.current) {
      excelExporter.current.save();
    }
  };

  const buttons = {
    edit: (rowData: Herramienta) =>
      CheckPermissions(auth, [0, 1])
        ? Router.push({
            pathname: "/bodegas/editar/" + (rowData.id as string),
          })
        : toast.error("No puedes acceder"),
    show: (rowData: Herramienta) =>
      CheckPermissions(auth, [0, 1])
        ? Router.push({
            pathname: "/bodegas/show/" + (rowData.id as string),
          })
        : toast.error("No puedes acceder"),
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
            {!CheckPermissions(auth, [1, 2]) && (
            <Button
              className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-blue-900"
              onClick={() =>
                CheckPermissions(auth, [0])
                  ? Router.push({ pathname: "/bodegas/create" })
                  : toast.info("No puede ingresar bodegas")
              }
            >
              Crear bodega
            </Button>
            )}
            {/* Tabla de herramientas */}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default BodegasPage;
