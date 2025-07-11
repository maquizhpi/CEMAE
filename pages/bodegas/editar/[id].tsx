// pages/bodegas/editar/[id].tsx

import React from "react";
import Sidebar from "../../components/sidebar";
import TabContainer, { TabPanel } from "../../components/tab_container";

import UbicacionesPanel from "../../layouts/config/ubicaciones";
import ModelosPanel from "../../layouts/config/modelos";

const EditarBodega = () => {
  const tabPanels: Array<TabPanel> = [
    
    { name: "Ubicaciones", content: <UbicacionesPanel /> },
    { name: "Modelos", content: <ModelosPanel /> },
  ];

  return (
    <div className="flex h-screen">
      <div className="md:w-1/6 max-w-none">
        <Sidebar />
      </div>
      <div className="w-12/12 md:w-5/6 h-screen flex items-center justify-center bg-blue-100">
        <div className="w-11/12 bg-white my-14">
          <h2 className="text-center text-3xl font-extrabold text-blue-800 mb-6">
            Editar Bodega
          </h2>
          <TabContainer tabPanels={tabPanels} />
        </div>
      </div>
    </div>
  );
};

export default EditarBodega;
