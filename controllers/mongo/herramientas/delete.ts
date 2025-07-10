import { NextApiRequest, NextApiResponse } from "next";
import { AuditoryModel, HerramientaModel } from "../../../database/schemas";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const id = req.query.id as string;
    const userName = req.headers.username as string;

    const deleted = await HerramientaModel.findByIdAndRemove(id);

    if (!deleted) {
      return res.status(404).json({
        message: "herramienta no encontrada",
        success: false,
      });
    }

    const auditory = new AuditoryModel({
      date: FormatedDate(),
      user: userName,
      action: "Eliminó la herramienta: " + deleted.nombre,
    });
    await auditory.save();

    return res.status(200).json({
      message: "herramienta eliminada",
      success: true,
    });
  } catch (error) {
    console.error("Error al eliminar herramienta:", error);
    return res.status(500).json({
      message: "Error inesperado",
      success: false,
    });
  }
}
