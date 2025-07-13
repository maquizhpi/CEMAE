import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReporteSolicitudes = (title: string, solicitudes: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezados institucionales
  doc.addImage('/image/logo1.jpeg', 'JPEG', pageWidth / 2 - 15, 10, 30, 20);
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

  // Encabezado de tabla
  const headers = [["#", "Receptor", "Herramientas", "fecha","bodeguero", "Estado","Bodega","Ubicacion", "Observacion",]];

  const body = solicitudes.map((solicitud, index) => {
    const receptor = solicitud.receptor?.nombre || "Sin nombre";
    const herramientas = (solicitud.herramientas ?? [])
      .map((h: any) => h.nombre?.toUpperCase())
      .join(",\n"); // salto de línea para cada herramienta 
    const fecha = solicitud.fecha ?? "Desconocido";
    const bodeguero = solicitud.bodeguero?.nombre;
    const estado = solicitud.estado ?? "Desconocido";
    const bodega = solicitud.bodega ?? "Desconocido";
    const ubicacion = (solicitud.herramientas ?? [])
      .map((h: any) => h.ubicacion?.toUpperCase())
      .join(",\n"); // salto de línea para cada herramienta 
    const observacion = solicitud.observacion ?? "";

    return [
      index + 1,
      receptor,
      herramientas,
      fecha,
      bodeguero,
      estado.toUpperCase(),
      bodega,
      ubicacion,
      observacion,
    ];
  });

  if (body.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("No se encontraron solicitudes realizadas.", pageWidth / 2, 70, { align: 'center' });
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
      bodyStyles: {
        halign: 'left',
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      theme: 'grid'
    });
  }

  doc.save(`${title}.pdf`);
};
