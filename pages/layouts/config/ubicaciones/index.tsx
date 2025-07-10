import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingContainer from "../../../components/loading_container";
import { useAuth } from "../../../../controllers/hooks/use_auth";
import { ResponseData, Ubicaciones } from "../../../../models";
import HttpClient from "../../../../controllers/utils/http_client";
import TreeTable, { ColumnData } from "../../../components/tree_table";
import UbicacionesModal from "../../../components/modals/modalUbicaciones";

const UbicacionesPanel = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [tableData, setTableData] = useState<Array<Ubicaciones>>([]);
  const [editingUbicaciones, setEditingUbicaciones] =
    useState<Ubicaciones | null>(null);

  const loadData = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/ubicaciones",
      "GET",
      auth.usuario,
      auth.rol
    );
    if (response.success) {
      const users: Array<any> = response.data;
      setTableData(users);
    } else {
      toast.warning(response.message);
    }
    setLoading(false);
  };

  // ejecuta funcion al renderizar la vista
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showModal = () => setModalVisible(true);
  const hideModal = async () => {
    if (editingUbicaciones != null) setEditingUbicaciones(null);
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
      dataField: "nombre",
      caption: "Nombre",
    },
    {
      dataField: "bodega",
      caption: "Bodega",
    }
  ];

  const buttons = {
    edit: (rowData: any) => {
      setEditingUbicaciones(rowData);
      showModal();
    },
    delete: async (rowData: any) => {
      await HttpClient(
        "/api/ubicaciones/" + rowData.id,
        "DELETE",
        auth.usuario,
        auth.rol
      );
      toast.success("ubicacion eliminada");
      await loadData();
    },
  };

  return (
    <div style={{ padding: "40px 0" }}>
      <button
        className="text-center bg-transparent hover:bg-blue-600 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        onClick={showModal}
      >
        Crear ubicacion
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
            `Página ${actual} de ${total} (${items} Ubicaciones)`
          }
        />
      </LoadingContainer>
      <UbicacionesModal
        visible={modalVisible}
        close={hideModal}
        initialData={editingUbicaciones}
        onDone={async (newUser: Ubicaciones) => {
          console.log(newUser);
          const response: ResponseData =
            editingUbicaciones == null
              ? await HttpClient(
                  "/api/ubicaciones",
                  "POST",
                  auth.usuario,
                  auth.rol,
                  newUser
                )
              : await HttpClient(
                  "/api/ubicaciones",
                  "PUT",
                  auth.usuario,
                  auth.rol,
                  newUser
                );
          if (response.success) {
            toast.success(
              editingUbicaciones == null
                ? "Ubicacion creada!"
                : "Ubicacion actualizada!"
            );
          } else {
            toast.warning(response.message);
          }
        }}
      />
    </div>
  );
};

export default UbicacionesPanel;