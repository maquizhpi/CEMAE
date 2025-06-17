import { Button, Form } from "react-bootstrap";
import Sidebar from "../components/sidebar";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useState } from "react";
import HttpClient from "../../controllers/utils/http_client";
import { Bodega, Herramienta } from "../../models";
import TreeTable, { ColumnData } from "../components/tree_table";
import Router from "next/router";

export const herramientasPage = () => {
  const { auth } = useAuth();
  const [bodegas, setBodegas] = useState<Array<Bodega>>([]);
  const [selectedBodega, setSelectedBodega] = useState<string>("");
  const [herramientas, setHerramientas] = useState<Array<Herramienta>>([]);
  const [herramientasAdmin, setHerramientasAdmin] = useState<Array<Herramienta>>([]);
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
      // Admin: mostrar solo bodegas con herramientas
      const bodegasConHerramientas = bodegasData.filter(
        (b) => b.herramientas && b.herramientas.length > 0
      );
      setBodegas(bodegasConHerramientas);

      // Unir todas las herramientas de esas bodegas
      const todasHerramientas: Herramienta[] = bodegasConHerramientas.flatMap(
        (b) => b.herramientas.map((h) => ({ ...h, nombreBodega: b.nombreBodega }))
      );
      setHerramientasAdmin(todasHerramientas);
    } else {
      // Bodeguero: solo las bodegas asignadas
      const bodegasFiltradas = bodegasData.filter(
        (b) =>
          b.bodegueroAsignado &&
          b.bodegueroAsignado.toLowerCase() === auth.usuario.toLowerCase()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedBodega) {
      const bodegaSeleccionada = bodegas.find((b) => b.id === selectedBodega);
      setHerramientas(bodegaSeleccionada?.herramientas ?? []);
    } else {
      setHerramientas([]);
    }
  }, [selectedBodega, bodegas]);

  const columns: ColumnData[] = [
    {
      dataField: "numero",
      caption: "#",
      alignment: "center",
      cssClass: "bold",
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
    },
    {
      dataField: "serie",
      caption: "Serie",
      alignment: "center",
      cssClass: "bold",
    },
    {
      dataField: "modelo",
      caption: "Modelo",
      alignment: "center",
      cssClass: "bold",
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
    {
      dataField: "imagen",
      caption: "imagen",
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
                dataSource={
                  auth.rol === 0 ? herramientasAdmin : herramientas
                }
                columns={columns}
                searchPanel={true}
                buttonsFirst
                paging
                showNavigationButtons
                showNavigationInfo
                pageSize={100}
                infoText={(actual, total, items) =>
                  `Página ${actual} de ${total} (${items} herramientas)`
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default herramientasPage;
