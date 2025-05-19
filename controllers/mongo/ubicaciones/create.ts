import { NextApiRequest, NextApiResponse } from "next";
import {
  AuditoryModel,
  HerramientaModel,
  UbicacionesModel,
} from "../../../database/schemas";
import { Ubicaciones } from "../../../models";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const Ubicacion = req.body as Ubicaciones;
  const userName = req.headers.username as string;
  // fetch the posts
  const Ubicacionpost = new UbicacionesModel({ ...Ubicacion });

  await Ubicacionpost.save();

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Creo una Ubicacion: " + Ubicacionpost.nombre,
  });
  await auditory.save();

  return res.status(200).json({
    message: "Ubicacion Creada",
    success: true,
  });
}
