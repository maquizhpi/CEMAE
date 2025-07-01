import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Herramienta } from "../../../models";

export const generateReporteHerramienta = (title: string, herramientas: Herramienta[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado institucional con logo y títulos centrados
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
  doc.setTextColor(0, 0, 0); // restaurar color

  if (herramientas.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("NO SE ENCONTRARON HERRAMIENTAS", pageWidth / 2, 70, { align: 'center' });
  } else {
    const headers = [["#", "Código", "Nombre", "Marca", "Serie", "Ubicación", "Estado", "Calibración"]];

    const body = herramientas.map((h, index) => [
      index + 1,
      h.codigo ?? "",
      h.nombre?.toUpperCase() ?? "",
      h.marca?.toUpperCase() ?? "",
      h.serie ?? "",
      h.ubicacion ?? "",
      h.estado?.toUpperCase() ?? "",
      h.calibracion?.toUpperCase() ?? "",
    ]);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 65,
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [0, 112, 192],
        textColor: 255,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: { halign: 'left' },
      theme: 'striped',
      tableLineWidth: 0.1,
      tableLineColor: [0, 0, 0],
    });
  }

  doc.save(`${title}.pdf`);
};
