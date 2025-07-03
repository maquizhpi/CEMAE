interface HerramientaData {
  nombre: string;
  serie: string;
  ubicacion: string;
  estado: string;
}

interface DatosSolicitud {
  nombre: string;        // Receptor
  fecha: string;
  herramientas: HerramientaData[];
  observacion: string;
  estado: string;
}

export const enviarReportePorWhatsApp = (numero: string, datos: DatosSolicitud) => {
  let numeroFormateado = numero.replace(/\s+/g, "").replace("+", "");

  if (/^0\d{9}$/.test(numeroFormateado)) {
    numeroFormateado = "593" + numeroFormateado.slice(1);
  }

  // Generar el texto con todas las herramientas
  const herramientasTexto = Array.isArray(datos.herramientas)
    ? datos.herramientas.map((h, index) => {
        return `🔧 *${index + 1}. ${h.nombre}*
  🔢 Serie: ${h.serie}
  📍 Ubicación: ${h.ubicacion}
  📌 Estado: ${h.estado}\n`;
      }).join("\n")
    : "⚠️ No hay herramientas registradas.";


  const mensaje = `
 *REPORTE DE SOLICITUD DE HERRAMIENTAS*
 Receptor: ${datos.nombre}
 Fecha: ${datos.fecha}
 Estado: ${datos.estado}
 Herramientas entregadas:
${herramientasTexto}
 *Observación: ${datos.observacion}*
`;

  const url = `https://wa.me/${numeroFormateado}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
};
