import { NextApiRequest, NextApiResponse } from "next";
import { ModeloHerramientaModel, AuditoryModel } from "../../../database/schemas";
import FormatedDate from "../../utils/formated_date";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = req.query.id as string;
    const userName = req.headers.username as string;

    if (!id) {
      return res.status(400).json({
        message: "ID del modelo no proporcionado",
        success: false,
      });
    }

    const deleted = await ModeloHerramientaModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Modelo no encontrado",
        success: false,
      });
    }

    const auditory = new AuditoryModel({
      date: FormatedDate(),
      user: userName,
      action: "Eliminó el Modelo: " + deleted.nombre,
    });
    await auditory.save();

    return res.status(200).json({
      message: "Modelo eliminado correctamente",
      success: true,
    });
  } catch (error) {
    console.error("Error al eliminar modelo:", error);
    return res.status(500).json({
      message: "Error interno al eliminar el modelo",
      success: false,
    });
  }
}
