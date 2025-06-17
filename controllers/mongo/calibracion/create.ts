import { NextApiRequest, NextApiResponse } from "next";
import {
  AuditoryModel,
  BackupCalibracionModel,
  CalibracionModel,
} from "../../../database/schemas";
import { Calibracion } from "../../../models";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const solicitud = req.body as Calibracion; //clave estudiar parta explicar todos los create//
  const userName = req.headers.username as string;
  const count: number = await BackupCalibracionModel.countDocuments();
  // fetch the posts
  const solicitudpost = new CalibracionModel({ ...solicitud, number: count + 1 });

  await solicitudpost.save();

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Creo una solicitud de calibracion: " + solicitudpost.number,
  });
  await auditory.save();

  const backup = new BackupCalibracionModel({ solicitud: solicitudpost._id });

  await backup.save();

  return res.status(200).json({
    message: "solicitud Creada",
    success: true,
  });
}
