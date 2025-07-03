import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReporteBodegas = (title: string, bodegas: any[]) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado institucional
  doc.addImage('/image/logo2.jpeg', 'JPEG', pageWidth / 2 - 15, 10, 30, 20);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('ESCUDARÓN DE ASALTO SUPER PUMA', pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(12);
  doc.text('BRIGADA DE AVIACIÓN DEL EJÉRCITO BAE 15 "PAQUISHA"', pageWidth / 2, 42, { align: 'center' });

  doc.setFontSize(11);
  doc.text('BODEGA DE HERRAMIENTAS', pageWidth / 2, 49, { align: 'center' });

  // Título del reporte
  doc.setFontSize(12);
  doc.setTextColor(200, 0, 0);
  doc.text(title, pageWidth / 2, 58, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Encabezados de la tabla
  const headers = [[
    "#", "Nombre Bodega", "Bodeguero", "Creador", 
    "Fecha Creación", "Herramientas"
  ]];

  // Cuerpo de la tabla
  const body = bodegas.map((bodega, index) => [
    index + 1,
    bodega.nombreBodega ?? "N/A",
    bodega.bodegueroAsignado?.nombre ?? "N/A",
    bodega.creador?.nombre ?? "N/A",
    bodega.fechaDeCreacion ?? "N/A",
    bodega.herramientas?.length ?? 0
  ]);

  if (body.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("No se encontraron bodegas registradas.", pageWidth / 2, 70, { align: 'center' });
  } else {
    autoTable(doc, {
      head: headers,
      body: body,
      startY: 65,
      styles: {
        fontSize: 9,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [0, 0, 200],
        textColor: 255,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        halign: 'center',
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      theme: 'grid'
    });
  }

  doc.save(`${title}.pdf`);
};
