import { NextApiRequest, NextApiResponse } from "next";
import { AuditoryModel, SolicitudeModel } from "../../../database/schemas";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;
  const userName = req.headers.username as string;

  try {
    const resp = await SolicitudeModel.findByIdAndRemove(id);

    if (!resp) {
      return res.status(404).json({
        message: "Solicitud no encontrada",
        success: false,
      });
    }

    const auditory = new AuditoryModel({
      date: FormatedDate(),
      user: userName,
      action: "Eliminó una solicitud: " + resp.number,
    });

    await auditory.save();

    return res.status(200).json({
      message: "Solicitud eliminada correctamente",
      success: true,
    });

  } catch (error) {
    console.error("Error al eliminar solicitud:", error);
    return res.status(500).json({
      message: "Error inesperado",
      success: false,
    });
  }
}
