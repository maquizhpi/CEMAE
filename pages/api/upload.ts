import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // Desactiva el bodyParser para manejar archivos
  },
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "public/uploads"); // Carpeta donde se guardarán los archivos
  form.keepExtensions = true; // Mantiene la extensión del archivo

  // Procesar la subida del archivo
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "Error al subir archivo" });
    }

    const file = files.file;
    const newFilePath = path.join(form.uploadDir, file.newFilename);

    fs.rename(file.filepath, newFilePath, (renameErr) => {
      if (renameErr) {
        return res.status(500).json({ message: "Error al guardar archivo" });
      }

      const fileUrl = `/uploads/${file.newFilename}`;
      res.status(200).json({ success: true, url: fileUrl });
    });
  });
}
