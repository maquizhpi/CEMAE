import { NextApiRequest, NextApiResponse } from "next";
import {
  AuditoryModel,
  BackupSolicitudesModel,
  SolicitudeModel,
} from "../../../database/schemas";
import { Solicitude } from "../../../models";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const solicitud = req.body as Solicitude;
  const userName = req.headers.username as string;
  const count: number = await BackupSolicitudesModel.countDocuments();
  // fetch the posts
  const solicitudpost = new SolicitudeModel({ ...solicitud, number: count + 1 });

  await solicitudpost.save();

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Creo una solicitud: " + solicitudpost.number,
  });
  await auditory.save();

  const backup = new BackupSolicitudesModel({ solicitud: solicitudpost._id });

  await backup.save();

  return res.status(200).json({
    message: "solicitud Creada",
    success: true,
  });
}