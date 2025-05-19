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

  const newsolicitud = (): Solicitude => {
    return solicitud;
  };

  const resp = await SolicitudeModel.findOneAndUpdate(
    {
      _id: solicitud.id,
    },
    newsolicitud()
  );

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Actualizo a la solicitud:" + solicitud.number,
  });
  await auditory.save();

  if (resp === null)
    return res.status(500).json({
      message: "solicitud no encontrada",
      success: false,
    });

  return res.status(200).json({
    message: "solicitud editada",
    success: true,
  });
}
