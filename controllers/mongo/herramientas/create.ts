import { NextApiRequest, NextApiResponse } from "next";
import { AuditoryModel, HerramientaModel,  } from "../../../database/schemas";
import { Herramienta } from "../../../models";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const herramienta = req.body as Herramienta;
  const userName = req.headers.username as string;
  // fetch the posts
  const herramientapost = new HerramientaModel({ ...herramienta });

  await herramientapost.save();

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Creo una herramienta: " + herramientapost.nombre,
  });
  await auditory.save();

  return res.status(200).json({
    message: "Herramienta Creada",
    success: true,
  });
}
