import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Sidebar from "../components/sidebar";
import { useAuth } from "../../controllers/hooks/use_auth";
import { ResponseData, Ubicaciones } from "../../models";
import HttpClient from "../../controllers/utils/http_client";
import TreeTable, { ColumnData } from "../components/tree_table";
import LoadingContainer from "../components/loading_container";
import UbicacionesModal from "../components/modals/modalUbicaciones";

// Componente principal del panel de ubicaciones
const UbicacionesPanel = () => {
    const { auth } = useAuth(); // Hook de autenticación
    const [loading, setLoading] = useState<boolean>(true); // Estado de carga
    const [modalVisible, setModalVisible] = useState<boolean>(false); // Estado de visibilidad del modal
    const [tableData, setTableData] = useState<Array<Ubicaciones>>([]); // Datos de la tabla
    const [editingUbicaciones, setEditingUbicaciones] =
        useState<Ubicaciones | null>(null); // Ubicación en edición

    // Función para cargar los datos de ubicaciones
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

    // Ejecuta loadData al montar el componente
    useEffect(() => {
        loadData();
    }, []);

    // Muestra el modal
    const showModal = () => setModalVisible(true);

    // Oculta el modal y recarga los datos
    const hideModal = async () => {
        if (editingUbicaciones != null) setEditingUbicaciones(null);
        setModalVisible(false);
        await loadData();
    };

    // Definición de columnas para la tabla.
    const columns: ColumnData[] = [
        {
            dataField: "index",
            caption: "#",
            cellRender: (params: any) => (params.rowIndex ?? 0) + 1,
            width: 60,
        },
        
        {
            dataField: "nombre",
            caption: "Nombre Ubicación",
        },
        {
            dataField: "bodega",
            caption: "Bodega",
        },
        {
            dataField: "bodegueroAsignado",
            caption: "Bodeguero Asignado",
            cellRender: (cellData: any) => cellData.value?.nombre || "N/A",
        },
    ];

    // Botones de acción para la tabla
    const buttons = {
    edit: (rowData: any) => {
        setEditingUbicaciones(rowData);
        showModal();
    },

    delete: async (rowData: any) => {
        if (confirm(`¿Deseas eliminar la ubicación "${rowData.nombre}"?`)) {
        const response = await HttpClient(
            `/api/ubicaciones/${rowData.id ?? rowData._id}`,
            "DELETE",
            auth.usuario,
            auth.rol
            );

        if (response.success) {
            toast.success("Ubicación eliminada");
            await loadData();
        } else {
            toast.warning(response.message);
        }
        }
    },
    };


    return (
        <div className="flex h-screen">
            {/* Sidebar de navegación */}
            <div className="md:w-1/6 max-w-none">
                <Sidebar />
            </div>
            {/* Contenido principal */}
            <div className="w-12/12 md:w-5/6 bg-blue-100 p-4">
                <div className="bg-white w-5/6 mx-auto p-6 m-5 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
                        Registro de Ubicaciones
                    </h1>
                    <div style={{ padding: "40px 0" }}>
                        {/* Botón para crear nueva ubicación */}
                        <button
                            className="text-center bg-transparent hover:bg-blue-600 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                            onClick={showModal}
                        >
                            Crear ubicacion
                        </button>
                        {/* Contenedor de carga y tabla de ubicaciones */}
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
                        {/* Modal para crear/editar ubicaciones */}
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
                </div>
            </div>
        </div>
    );
};

export default UbicacionesPanel;
