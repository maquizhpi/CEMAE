import React from "react";
import { Herramienta } from "../../../models";
import theme from "../../../controllers/styles/theme";
import Image from "next/image";

interface Props {
  visible: boolean;
  close: () => void;
  herramienta: Herramienta | null;
}

const CatalogoHerramientaModal = ({ visible, close, herramienta }: Props) => {
  if (!herramienta) return null;

  return (
    <>
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${
          visible ? "" : "hidden"
        }`}
      >
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="bg-white px-4 py-5 rounded shadow-lg z-10 w-[90%] max-w-md h-[90vh] overflow-y-auto">
          <div
            style={{ color: theme.colors.blue }}
            className="text-center text-xl mb-2 font-semibold"
          >
            Detalles de la Herramienta
          </div>
          <hr />

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-3 mt-4">
            <div className="flex justify-center">
              <Image
                src={herramienta.imagen || "/no-imagen.jpg"} 
                alt="imagen herramienta"
                width={64}
                height={64}
                className="w-full max-w-xs max-h-60 object-contain rounded border shadow" 
              />
            
            </div>
            <div className="space-y-2 text-gray-700 text-sm">
              <p><strong>Nombre:</strong> {herramienta.nombre}</p>
              <p><strong>Código:</strong> {herramienta.codigo}</p>
              <p><strong>Modelo:</strong> {herramienta.modelo}</p>
              <p><strong>Marca:</strong> {herramienta.marca}</p>
              <p><strong>Serie:</strong> {herramienta.serie}</p>
              <p><strong>Ubicación:</strong> {herramienta.ubicacion}</p>
              <p><strong>Estado:</strong> {herramienta.estado}</p>
              <p><strong>Calibración:</strong> {herramienta.calibracion}</p>
              <p><strong>Tipo:</strong> {herramienta.tipo}</p>
              <p><strong>Descripción:</strong> {herramienta.descripcion}</p>
              <p><strong>Observación:</strong> {herramienta.observacion}</p>
              <p><strong>Bodega:</strong> {herramienta.nombreBodega}</p>
            </div>
          </div>

          <hr />

          <div className="flex justify-center mt-4 gap-4">
            <button
              className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
              onClick={close}
            >
              Regresar al catálogo
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogoHerramientaModal;
