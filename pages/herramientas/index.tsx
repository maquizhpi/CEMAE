/* eslint-disable react/no-unescaped-entities */
import { Button, Form } from "react-bootstrap";
import Sidebar from "../components/sidebar";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useState } from "react";
import HttpClient from "../../controllers/utils/http_client";
import { Bodega, Herramienta } from "../../models";
import TreeTable, { ColumnData } from "../components/tree_table";
import Router from "next/router";
import { CheckPermissions } from "../../controllers/utils/check_permissions";
import { generateReporteHerramienta } from "../bodegas/reporte/reporteHerramientas";

export const HerramientasPage = () => {
  const { auth } = useAuth();

  const [bodegas, setBodegas] = useState<Array<Bodega>>([]);
  const [selectedBodega, setSelectedBodega] = useState<string>("");
  const [herramientas, setHerramientas] = useState<Array<Herramienta>>([]);
  const [herramientasAdmin, setHerramientasAdmin] = useState<Array<Herramienta>>([]);
  const [filteredHerramientas, setFilteredHerramientas] = useState<Array<Herramienta>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBodegas = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );

    const bodegasData: Bodega[] = response.data ?? [];

    if (auth.rol === 0) {
      const bodegasConHerramientas = bodegasData.filter(
        (b) => b.herramientas && b.herramientas.length > 0
      );
      setBodegas(bodegasConHerramientas);

      const todasHerramientas: Herramienta[] = bodegasConHerramientas.flatMap(
        (b) => b.herramientas.map((h) => ({ ...h, nombreBodega: b.nombreBodega }))
      );
      setHerramientasAdmin(todasHerramientas);
      setFilteredHerramientas(todasHerramientas);
    } else {
      const bodegasFiltradas = bodegasData.filter(
        (b) =>
          b.bodegueroAsignado &&
          b.bodegueroAsignado?.identificacion === auth.identificacion
      );
      setBodegas(bodegasFiltradas);
      if (bodegasFiltradas.length > 0) {
        setSelectedBodega(bodegasFiltradas[0].id);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBodegas();
  }, []);

  useEffect(() => {
    if (selectedBodega) {
      const bodegaSeleccionada = bodegas.find((b) => b.id === selectedBodega);
      const herramientasFiltradas = bodegaSeleccionada?.herramientas ?? [];
      setHerramientas(herramientasFiltradas);
      setFilteredHerramientas(herramientasFiltradas);
    } else {
      setHerramientas([]);
      setFilteredHerramientas([]);
    }
  }, [selectedBodega, bodegas]);

  const handleDelete = (herramienta: Herramienta) => {
    if (confirm(`¿Estás seguro de eliminar la herramienta "${herramienta.nombre}"?`)) {
      deleteTool(herramienta);
    }
  };

  const deleteTool = async (herramienta: Herramienta) => {
    const bodega = bodegas.find(b =>
      (b.herramientas ?? []).some(h => h._id === herramienta._id)
    );

    if (!bodega) {
      toast.error("Bodega no encontrada.");
      return;
    }

    const herramientasActualizadas = (bodega.herramientas ?? []).filter(h =>
      h._id !== herramienta._id
    );

    const bodegaActualizada = {
      ...bodega,
      herramientas: herramientasActualizadas,
    };

    const response = await HttpClient(
      "/api/bodegas",
      "PUT",
      auth.usuario,
      auth.rol,
      bodegaActualizada
    );

    if (response.success) {
      toast.success(`Herramienta "${herramienta.nombre}" eliminada correctamente!`);
      loadBodegas();
    } else {
      toast.error("Error al eliminar la herramienta.");
    }
  };

  const columns: ColumnData[] = [
    {
      dataField: "numero",
      caption: "#",
      alignment: "center",
      cssClass: " bold",
      cellRender: (params: any) => params.rowIndex + 1,
    },
    {
      dataField: "codigo",
      caption: "Código",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "nombre",
      caption: "Nombre",
      alignment: "center",
      cssClass: "bold",
      cellRender: (params: any) => (
        <span className="uppercase">{params.data.nombre}</span>)
    },
    {
      dataField: "serie",
      caption: "Serie",
      alignment: "center",
      cssClass: "bold",
      cellRender: (params: any) => (
        <span className="uppercase">{params.data.serie}</span>)
    },
    {
      dataField: "modelo",
      caption: "Modelo",
      alignment: "center",
      cssClass: "bold",
      cellRender: (params: any) => (
        <span className="uppercase">{params.data.modelo}</span>)
    },
    {
      dataField: "marca",
      caption: "Marca",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "nParte",
      caption: "N° Parte",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "observacion",
      caption: "Observación",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "ubicacion",
      caption: "Ubicación",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "estado",
      caption: "Estado",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "calibracion",
      caption: "Calibración",
      alignment: "center",
      cssClass: "bold",
    },
    ...(auth.rol === 0
      ? [
          {
            dataField: "nombreBodega",
            caption: "Bodega",
            alignment: "center" as "center",
            cssClass: "bold",
          },
        ]
      : []),
  ];

  const buttons = {
    edit: (rowData: Herramienta) =>
      CheckPermissions(auth, [0, 1])
        ? Router.push({ pathname: "/herramientas/edit/" + (rowData.id as string) })
        : toast.error("No puedes acceder"),
    show: (rowData: Herramienta) => {
      if (rowData.imagen) {
        window.open(rowData.imagen, "_blank");
      } else {
        toast.error("No hay imagen subida");
      }
    },
    delete: (rowData: Herramienta) => {
      if (CheckPermissions(auth, [0, 1])) {
        handleDelete(rowData);
      } else {
        toast.error("No tienes permisos para eliminar");
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
          <div className="bg-white w-11/12 h-5/6 mx-auto">
            <div className="mt-6">
              <p className="md:text-4xl text-xl text-center pt-5 font-extrabold text-blue-500">
                {auth.rol === 0
                  ? "Todas las Herramientas Registradas"
                  : "Herramientas por Bodega"}
              </p>
            </div>

            {CheckPermissions(auth, [1]) && (
              <>
                <Button
                  className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-blue-900"
                  onClick={() =>
                    Router.push({ pathname: "/herramientas/create" })
                  }
                >
                  Crear registro
                </Button>

                <Button
                  className="text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-3 text-center mx-2 mb-2 mt-3 dark:focus:ring-blue-900"
                  onClick={() =>
                    Router.push({ pathname: "/herramientas/importar" })
                  }
                >
                  Importar herramientas
                </Button>
              </>
            )}

            {auth.rol !== 0 && (
              <div className="p-4">
                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-blue-800">
                    Seleccione una bodega:
                  </label>
                  <select
                    value={selectedBodega}
                    onChange={(e) => setSelectedBodega(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm"
                  >
                    <option value="">-- Selecciona --</option>
                    {bodegas.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombreBodega}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="p-2">
              <TreeTable
                keyExpr="id"
                dataSource={auth.rol === 0 ? herramientasAdmin : herramientas}
                buttons={buttons}
                columns={columns}
                searchPanel={true}
                buttonsFirst
                paging
                showNavigationButtons
                showNavigationInfo
                pageSize={15}
                infoText={(actual, total, items) =>
                  `Página ${actual} de ${total} (${items} herramientas)`
                }
                onFilteredDataChange={setFilteredHerramientas}
              />
            </div>

            <div className="px-8 pb-8">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
                onClick={() =>
                  generateReporteHerramienta(
                    "REPORTE DE BODEGA - DATOS FILTRADOS",
                    filteredHerramientas
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

export default HerramientasPage;
