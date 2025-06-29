import * as XLSX from "xlsx";
import { Button } from "react-bootstrap";

const DescargarFormatoExcel = () => {
  const handleDownloadTemplate = () => {
    const wsData = [
      [
        "Nombre",
        "Código",
        "Descripción",
        "Serie",
        "Modelo",
        "Marca",
        "N°Parte",
        "Ubicación",
        "Estado",
        "Tipo",
        "Cantidad",
        "Observación",
        "Bodega",
        "Calibración",
      ],
      // Fila vacía de ejemplo
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Herramientas");

    XLSX.writeFile(wb, "formato_herramientas.xlsx");
  };

  return (
    <Button
      onClick={handleDownloadTemplate}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg mt-4"
    >
      Descargar Formato Excel
    </Button>
  );
};

export default DescargarFormatoExcel;
