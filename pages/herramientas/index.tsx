import { Button, Form } from "react-bootstrap";
import Sidebar from "../components/sidebar";
import { toast } from "react-toastify";
import { useAuth } from "../../controllers/hooks/use_auth";
import { useEffect, useRef, useState } from "react";
import HttpClient from "../../controllers/utils/http_client";
import { Bodega, Herramienta } from "../../models";
import TreeTable, { ColumnData } from "../components/tree_table";
import Router from "next/router";


export const herramientasPage = () => {
  const { auth } = useAuth();
  const [bodegas, setBodegas] = useState<Array<Bodega>>([]);
  const [selectedBodega, setSelectedBodega] = useState<string>("");
  const [herramientas, setHerramientas] = useState<Array<Herramienta>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar bodegas asignadas al usuario
  const loadBodegas = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/bodegas",
      "GET",
      auth.usuario,
      auth.rol
    );
    const bodegasData: Bodega[] = response.data ?? [];
    const bodegasFiltradas =
      auth.rol === 1
        ? bodegasData
        : bodegasData.filter(
            (b) =>
              b.bodegueroAsignado &&
              b.bodegueroAsignado.toLowerCase() === auth.usuario.toLowerCase()
          );
    setBodegas(bodegasFiltradas);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBodega, bodegas]);

  const columns: ColumnData[] = [
    { dataField: "nombre", caption: "Nombre", alignment: "center", cssClass: "bold" },
    { dataField: "descripcion", caption: "Descripción", alignment: "center", cssClass: "bold" },
    { dataField: "cantidad", caption: "Cantidad", alignment: "center", cssClass: "bold" },
    { dataField: "estado", caption: "Estado", alignment: "center", cssClass: "bold" },

  ];

  const buttons = {
    edit: (rowData: Herramienta) =>
      Router.push({
        pathname: "/herramientas/editar/" + (rowData.id as string),
      }),
    show: (rowData: Herramienta) =>
      Router.push({
        pathname: "/herramientas/show/" + (rowData.id as string),
      }),
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
                Herramientas por Bodega
              </p>
            </div>
            <div className="p-4">

                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-blue-800">Seleccione una bodega:</label>
                  <select
                    value={selectedBodega}
                    onChange={(e) => setSelectedBodega(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm"
                  >
                    <option value="">-- Selecciona --</option>
                    {bodegas.map(b => (
                      <option key={b.id} value={b.id}>{b.nombreBodega}</option>
                    ))}
                  </select>
                </div>
            </div>
            <div className="p-2">
              {selectedBodega && (
                <TreeTable
                  keyExpr="id"
                  dataSource={herramientas}
                  buttons={buttons}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default herramientasPage;


