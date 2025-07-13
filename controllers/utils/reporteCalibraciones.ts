import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReporteCalibraciones = (title: string, calibraciones: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ENCABEZADO INSTITUCIONAL
  doc.addImage('/image/logo1.jpeg', 'JPEG', pageWidth / 2 - 15, 10, 30, 20);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('ESCUDARÓN DE ASALTO SUPER PUMA', pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(12);
  doc.text('BRIGADA DE AVIACIÓN DEL EJÉRCITO BAE 15 "PAQUISHA"', pageWidth / 2, 42, { align: 'center' });

  doc.setFontSize(11);
  doc.text('BODEGA DE HERRAMIENTAS', pageWidth / 2, 49, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(200, 0, 0);
  doc.text(title, pageWidth / 2, 58, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // ACTUALIZADO: Encabezados con Empresa incluida
  const headers = [[
    "#",
    "Herramienta",
    "Número de Serie",
    "Fecha Calibración",
    "Fecha Próxima Calibración",
    "Empresa",
    "Documento",
    "Estado"
  ]];

  const body = calibraciones.map((registro, index) => {
    const herramienta = registro.herramientas?.[0] || {};
    const documento = registro.documentoCalibracion?.trim() ? "Sí" : "No";

    return [
      index + 1,
      herramienta.nombre?.toUpperCase() || "N/A",
      herramienta.serie?.toUpperCase() || "N/A",
      registro.fechaCalibracion || "N/A",
      registro.fechaProximaCalibracion || "N/A",
      registro.empresaDeCalibracion || "N/A",
      documento,
      registro.estado?.toUpperCase() || "N/A",
    ];
  });

  if (body.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("No se encontraron registros de calibraciones.", pageWidth / 2, 70, { align: 'center' });
  } else {
    autoTable(doc, {
      head: headers,
      body: body,
      startY: 65,
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [0, 0, 200],
        textColor: 255,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: { halign: 'center' },
      theme: 'grid',
      tableLineWidth: 0.1,
      tableLineColor: [0, 0, 0],
    });
  }

  doc.save(`${title}.pdf`);
};
