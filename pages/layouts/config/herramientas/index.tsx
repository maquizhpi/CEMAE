import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingContainer from "../../../components/loading_container";
import { useAuth } from "../../../../controllers/hooks/use_auth";
import { ResponseData, Herramienta, Bodega } from "../../../../models";
import HttpClient from "../../../../controllers/utils/http_client";
import TreeTable, { ColumnData } from "../../../components/tree_table";
import HerramientaModal from "../../../components/modals/herramientaModal";


const HerramientasPanel = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Array<Herramienta>>([]);
  const [editingTool, setEditingTool] = useState<Herramienta | null>(null);

  const loadData = async () => {
    setLoading(true);
    const response: ResponseData = await HttpClient("/api/bodegas", "GET", auth.usuario, auth.rol);

    if (response.success) {
      const bodegas: Array<Bodega> = response.data;
      const herramientas: Herramienta[] = bodegas.flatMap((bodega) =>
        bodega.herramientas.map((h) => ({ ...h, nombreBodega: bodega.nombreBodega, bodegaId: bodega.id }))
      );
      setTableData(herramientas);
    } else {
      toast.warning(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showModal = () => setModalVisible(true);
  const hideModal = async () => {
    if (editingTool != null) setEditingTool(null);
    setModalVisible(false);
    await loadData();
  };

  const columns: ColumnData[] = [
    {
      dataField: "id",
      caption: "N°",
      cellRender: ({ rowIndex }) => rowIndex + 1,
    },
    {
      dataField: "codigo",
      caption: "Código",
    },
    {
      dataField: "nombre",
      caption: "Nombre",
    },
    {
      dataField: "modelo",
      caption: "Modelo",
    },
    {
      dataField: "marca",
      caption: "Marca",
    },
    {
      dataField: "estado",
      caption: "Estado",
    },
    {
      dataField: "nombreBodega",
      caption: "Bodega",
    },
  ];

  const buttons = {
    edit: (rowData: any) => {
      setEditingTool(rowData);
      showModal();
    },
    delete: async (rowData: any) => {
      const bodegaResponse = await HttpClient("/api/bodegas", "GET", auth.usuario, auth.rol);
      if (bodegaResponse.success) {
        const bodegas: Bodega[] = bodegaResponse.data;
        const bodega = bodegas.find((b) => b.id === rowData.bodegaId);

        if (!bodega) {
          toast.error("Bodega no encontrada");
          return;
        }

        const herramientasActualizadas = bodega.herramientas.filter((h) => h.id !== rowData._id);
        const bodegaActualizada = { ...bodega, herramientas: herramientasActualizadas };

        const response = await HttpClient("/api/bodegas", "PUT", auth.usuario, auth.rol, bodegaActualizada);

        if (response.success) {
          toast.success("Herramienta eliminada correctamente");
          loadData();
        } else {
          toast.error("Error al eliminar la herramienta");
        }
      }
    },
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <button
        className="text-center bg-transparent hover:bg-blue-600 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        onClick={showModal}
      >
        Crear herramienta
      </button>
      <LoadingContainer visible={loading} miniVersion>
        <TreeTable
          dataSource={tableData}
          columns={columns}
          buttons={buttons}
          searchPanel={true}
          colors={{ headerBackground: "#F8F9F9", headerColor: "#466cf2" }}
          paging
          showNavigationButtons
          showNavigationInfo
          pageSize={10}
          infoText={(actual, total, items) =>
            `Página ${actual} de ${total} (${items} Herramientas)`
          }
        />
      </LoadingContainer>
      <HerramientaModal
        visible={modalVisible}
        close={hideModal}
        initialData={editingTool}
        onDone={async (tool: Herramienta) => {
          const response: ResponseData =
            editingTool == null
              ? await HttpClient("/api/herramientas", "POST", auth.usuario, auth.rol, tool)
              : await HttpClient("/api/herramientas", "PUT", auth.usuario, auth.rol, tool);

          if (response.success) {
            toast.success(editingTool == null ? "Herramienta creada!" : "Herramienta actualizada!");
          } else {
            toast.warning(response.message);
          }
        }}
      />
    </div>
  );
};

export default HerramientasPanel;