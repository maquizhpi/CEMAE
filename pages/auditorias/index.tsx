import RoleLayout from "../layouts/role_layout";
import { useEffect, useState } from "react";
import LoadingContainer from "../components/loading_container";
import { useAuth } from "../../controllers/hooks/use_auth";
import HttpClient from "../../controllers/utils/http_client";
import { Auditory } from "../../models";
import Sidebar from "../components/sidebar";
import TreeTable, { ColumnData } from "../components/tree_table";

const AuditoryPage = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [tableData, setTableData] = useState<Array<Auditory>>([]);

  const loadData = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/auditory",
      "GET",
      auth.usuario,
      auth.rol
    );
    const auditories: Array<Auditory> = response.data ?? [];
    setTableData(auditories);
    setLoading(false);
  };

  const columns: ColumnData[] = [
    {
      dataField: "id",
      caption: "N°",
      alignment: "center",
      cellRender: ({ rowIndex }) => rowIndex + 1,
    },
    {
      dataField: "date",
      caption: "Fecha y Hora",
      alignment: "center",
    },
    {
      dataField: "user",
      caption: "Usuario",
      alignment: "center",
    },
    {
      dataField: "action",
      caption: "Acción realizada",
      alignment: "center",
    },
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RoleLayout permissions={[0]}>
      <title>Auditoría</title>
      <div className="flex h-full">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 flex items-center justify-center">
          <div className="w-11/12 bg-white my-14">
            <><p className="text-3xl text-center text-blue-800 font-bold mb-4">
              LISTADO DE AUDITORIAS
            </p></>
            <div className="flex justify-center mb-4">
              <p className="text-lg text-gray-600"> 
                Aquí se muestra el registro de todas las acciones realizadas por los usuarios.
              </p>
            </div>
                <button
                className="ml-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded shadow"
                onClick={() => {
                  const table = document.querySelector('.dx-treelist-container') as HTMLElement;
                  if (!table) return;
                  const printWindow = window.open('', '', 'width=900,height=700');
                  if (!printWindow) return;
                  printWindow.document.write(`
                  <html>
                  <head>
                  <title>Reporte de Auditoría</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
                    th { background: #F8F9F9; color: #CD5C5C; }
                  </style>
                  </head>
                  <body>
                  <h2 style="text-align:center;">LISTADO DE AUDITORIAS</h2>
                  ${table.outerHTML}
                  </body>
                  </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  printWindow.print();
                  printWindow.close();
                }}
                >
                Imprimir reporte 
                </button>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 m-2">
                <LoadingContainer visible={loading} miniVersion>
                <div className="w-full md:w-4/5 mx-auto overflow-x-auto">
                  <TreeTable
                  keyExpr="id"
                  dataSource={tableData}
                  columns={columns}
                  searchPanel={true}
                  style={{ minWidth: "600px", marginBottom: "40px" }}
                  colors={{
                    headerBackground: "#F8F9F9",
                    headerColor: "#CD5C5C",
                  }}
                  />
                </div>
                </LoadingContainer>
            </div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
};

export default AuditoryPage;
