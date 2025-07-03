import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { SolicitudeModel } from "../../../database/schemas";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createCanvas } from "canvas";
import { JSDOM } from "jsdom";

// Configuración necesaria para jsPDF en entorno Node.js
if (typeof window === "undefined") {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
  (global as any).window = dom.window;
  (global as any).document = dom.window.document;
  (global as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
  (global as any).HTMLImageElement = dom.window.HTMLImageElement;
  (global as any).Image = createCanvas(200, 200);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.body;

  const solicitud = await SolicitudeModel.findById(id).populate("receptor bodeguero herramientas");
  if (!solicitud || !solicitud.receptor?.correo) {
    return res.status(404).json({ success: false, message: "Solicitud no encontrada o sin correo." });
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // LOGO
    // Asegúrate de que el logo esté cargado como base64 si estás en Node.js puro
    // doc.addImage('/image/logo1.jpeg', 'JPEG', pageWidth / 2 - 15, 10, 30, 20);

    // ENCABEZADO
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 200);
    doc.text("Recibo de Entrega de Herramientas", pageWidth / 2, 20, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text('BRIGADA DE AVIACIÓN DEL EJÉRCITO BAE 15 "PAQUISHA"', pageWidth / 2, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.text("ESCUDARÓN DE ASALTO SUPER PUMA", pageWidth / 2, 36, { align: "center" });
    doc.setFontSize(10);
    doc.text("BODEGA DE HERRAMIENTAS", pageWidth / 2, 42, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text("No. " + (solicitud.number || "N/A"), pageWidth / 2, 48, { align: "center" });

    doc.setTextColor(0, 0, 0);

    // DATOS GENERALES
    const bodeguero = solicitud.bodeguero?.nombre ?? "N/A";
    const receptor = solicitud.receptor?.nombre ?? "N/A";
    const fecha = solicitud.fecha ?? "N/A";
    const estado = solicitud.estado ?? "N/A";

    doc.setFontSize(10);
    doc.text(`Bodeguero: ${bodeguero}`, 14, 56);
    doc.text(`Receptor: ${receptor}`, 14, 62);
    doc.text(`Fecha: ${fecha}`, 14, 68);
    doc.text("Observación:", 14, 74);
    doc.text(`Estado: ${estado}`, 14, 80);

    // TABLA DE HERRAMIENTAS
    const headers = [["#", "Descripción", "Marca", "Serie", "Bodega", "Ubicación"]];
    const herramientas = solicitud.herramientas ?? [];

    const body = herramientas.map((h: any, index: number) => [
      index + 1,
      h.nombre?.toUpperCase() || "N/A",
      h.marca?.toUpperCase() || "N/A",
      h.serie?.toUpperCase() || "N/A",
      "BODEGA DE HERRAMIENTAS CEMAE",
      h.ubicacion?.toUpperCase() || "N/A",
      
    ]);

    autoTable(doc, {
      head: headers,
      body,
      startY: 88,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [0, 0, 200],
        textColor: 255,
        halign: "center",
        valign: "middle",
      },
      bodyStyles: {
        halign: "center",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      theme: "grid",
    });

    // FIRMAS
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("Encargado de la Bodega", pageWidth / 4, finalY);   
    doc.setFontSize(9);
    doc.text(`Firma\nNombre: ${bodeguero}\nCédula: ${solicitud.bodeguero?.identificacion ?? "N/A"}`, pageWidth / 4, finalY + 20, { align: "center" });
    

    // GENERAR BUFFER
    const pdfBuffer = doc.output("arraybuffer");

    // ENVIAR POR CORREO
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CORREO_ENVIA,
        pass: process.env.CORREO_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sistema CEMAE" <${process.env.CORREO_ENVIA}>`,
      to: solicitud.receptor.correo,
      subject: `Reporte de solicitud No. ${solicitud.number}`,
      html: `<p>Estimado/a <strong>${receptor}</strong>,</p>
      <p>Adjunto encontrará el reporte en PDF de la entrega de herramientas correspondiente a la solicitud No. ${solicitud.number}.</p>`,
      attachments: [
        {
          filename: `Solicitud_${solicitud.number}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al enviar PDF:", error);
    return res.status(500).json({ success: false, message: "Error al generar o enviar el PDF" });
  }
}
