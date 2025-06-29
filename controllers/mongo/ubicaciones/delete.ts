import { NextApiRequest, NextApiResponse } from "next";
import { UbicacionesModel, AuditoryModel } from "../../../database/schemas";
import FormatedDate from "../../utils/formated_date";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = req.query.id as string;
    const userName = req.headers.username as string;

    if (!id) {
      return res.status(400).json({
        message: "ID de ubicación no proporcionado",
        success: false,
      });
    }

    const deleted = await UbicacionesModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Ubicación no encontrada",
        success: false,
      });
    }

    const auditory = new AuditoryModel({
      date: FormatedDate(),
      user: userName,
      action: "Eliminó la Ubicación: " + deleted.nombre,
    });
    await auditory.save();

    return res.status(200).json({
      message: "Ubicación eliminada correctamente",
      success: true,
    });
  } catch (error) {
    console.error("Error al eliminar ubicación:", error);
    return res.status(500).json({
      message: "Error interno al eliminar la ubicación",
      success: false,
    });
  }
}
