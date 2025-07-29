/* eslint-disable react/no-unescaped-entities */
import { Button, Spinner } from "react-bootstrap";
import Sidebar from "../components/sidebar";
import { CheckPermissions } from "../../controllers/utils/check_permissions";
import Router from "next/router";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useState, useCallback } from "react";
import HttpClient from "../../controllers/utils/http_client";
import { Solicitude } from "../../models";
import TreeTable, { ColumnData } from "../components/tree_table";
import { generateReporteSolicitudes } from "../../controllers/utils/reporteSolicitudes";
import { useRouter } from "next/router";

const SolicitudePage = () => {
  const router = useRouter();
  const { estado } = router.query;
  const { auth } = useAuth();
  const [tableData, setTableData] = useState<Solicitude[]>([]);
  const [filteredData, setFilteredData] = useState<Solicitude[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await HttpClient("/api/solicitudes", "GET", auth.usuario, auth.rol);
      let solicitudes: Solicitude[] = response.data ?? [];

      if (auth.rol !== 0) {
        solicitudes = solicitudes.filter(
          (s) =>
            s.bodeguero?.nombre?.toLowerCase() === auth.nombre?.toLowerCase() ||
            s.receptor?.nombre?.toLowerCase() === auth.nombre?.toLowerCase()
        );
      }

      const normalizadas = solicitudes.map((s) => ({
        ...s,
        id: s._id, 
        herramientas: s.herramientas ?? [],
        receptorNombre: s.receptor?.nombre ?? "N/A",
        bodegueroNombre: s.bodeguero?.nombre ?? "N/A",
      }));

      setTableData(normalizadas);
      // Si hay un estado en la URL, aplicamos filtro adicional
      let solicitudesFiltradas = normalizadas;

      if (estado && typeof estado === "string") {
        solicitudesFiltradas = normalizadas.filter(
          (s) => s.estado.toLowerCase() === estado.toLowerCase()
        );
      }

      setTableData(solicitudesFiltradas);

    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      toast.error("No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, [auth, estado]);

  useEffect(() => {
    if (auth?.usuario && auth.rol !== undefined) {
      loadData();
    }
  }, [auth, loadData]);


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
        return herramientas.length === 0
          ? "Sin herramientas"
          : (
              <ul>
                {herramientas.map((h: any, idx: number) => (
                  <li key={idx}>{h.nombre?.toUpperCase()}</li>
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
      minWidth: 80,
      cellRender: (cellData: any) => {
        const estado = cellData.value?.toLowerCase();
        let colorClass = "text-gray-500 font-bold";
        if (estado === "entregado") colorClass = "text-green-600 font-bold";
        else if (estado === "no entregado") colorClass = "text-red-600 font-bold";
        else if (estado?.includes("pendiente")) colorClass = "text-yellow-500 font-bold";
        return <span className={colorClass}>{cellData.value}</span>;
      },
    },
  ];

  const buttons = {
    download: (rowData: Solicitude) =>
      CheckPermissions(auth, [0, 1, 2])
        ? Router.push({ pathname: `/solicitudes/reporte/${rowData.id}` })
        : toast.error("No puedes acceder"),

    edit: (rowData: Solicitude) => {
      if (rowData.estado?.toLowerCase() === "entregado") {
        toast.error("No puedes editar una solicitud ya entregada.");
        return;
      }
      if (!CheckPermissions(auth, [0, 1])) {
        toast.error("Sin permisos para editar.");
        return;
      }
      Router.push({ pathname: `/solicitudes/edit/${rowData.id}` });
    },

    delete: async (rowData: Solicitude) => {
      if (!CheckPermissions(auth, [0, 1])) {
        toast.error("Sin permisos para eliminar.");
        return;
      }
      if (confirm("¿Seguro que deseas eliminar esta solicitud?")) {
        setLoading(true);
        try {
          await HttpClient(`/api/solicitudes/${rowData.id}`, "DELETE", auth.usuario, auth.rol);
          toast.success("Registro eliminado.");
          await loadData(); // Recargar los datos sin recargar la página
        } catch {
          toast.error("Error al eliminar solicitud.");
        } finally {
          setLoading(false);
        }
      }
    },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-full md:w-5/6 bg-blue-100">
        <div className="bg-white w-[95%] md:w-5/6 mx-auto mt-4 mb-4 p-4 rounded-lg shadow-md">
          <h1 className="text-3xl font-extrabold text-blue-500 text-center mb-4">
            Registro de solicitudes generadas
          </h1>

          {CheckPermissions(auth, [1]) && (
            <Button
              className="text-white bg-blue-400 hover:bg-blue-500 rounded-full text-sm px-5 py-3 mb-3"
              onClick={() => Router.push("/solicitudes/create")}
            >
              Crear registro
            </Button>
          )}

          <div className="w-full overflow-x-auto px-2">
            {loading ? (
              <div className="text-center py-10">
                <Spinner animation="border" role="status" />
                <p className="mt-2 text-gray-500">Cargando solicitudes...</p>
              </div>
            ) : (
              <TreeTable
                keyExpr="id"
                dataSource={tableData}
                columns={columns}
                searchPanel
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
            )}
          </div>

          <div className="px-8 pb-8">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
              onClick={() =>
                generateReporteSolicitudes(
                  "REPORTE DE SOLICITUDES FILTRADAS",
                  filteredData.length > 0 ? filteredData : tableData
                )
              }
              disabled={loading}
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
