import { NextApiRequest, NextApiResponse } from "next";
import { Solicitude } from "../../../models";
import FormatedDate from "../../utils/formated_date";
import { AuditoryModel, SolicitudeModel } from "../../../database/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const solicitud = req.body as Solicitude;
  const userName = req.headers.username as string;

  const updateFields = {
    number: solicitud.number,
    fecha: solicitud.fecha,
    bodeguero: solicitud.bodeguero,
    receptor: solicitud.receptor,
    estado: solicitud.estado,
    herramientas: solicitud.herramientas,
    observacion: solicitud.observacion ?? "",
  };

  const resp = await SolicitudeModel.findOneAndUpdate(
    { _id: solicitud.id },
    updateFields,
    { new: true }
  );

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Actualizó la solicitud: " + solicitud.number,
  });
  await auditory.save();

  if (resp === null)
    return res.status(500).json({
      message: "Solicitud no encontrada",
      success: false,
    });

  return res.status(200).json({
    message: "Solicitud editada",
    success: true,
    data: resp,
  });
}
