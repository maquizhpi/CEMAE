import { NextApiRequest, NextApiResponse } from "next";
import {
  AuditoryModel,
  ModeloHerramientaModel,
} from "../../../database/schemas";
import { ModelosHerramienta } from "../../../models";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const Modelo = req.body as ModelosHerramienta;
  const userName = req.headers.username as string;
  // fetch the posts
  const Modelopost = new ModeloHerramientaModel({ ...Modelo });

  await Modelopost.save();

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Creo un modelo: " + Modelopost.nombre,
  });
  await auditory.save();

  return res.status(200).json({
    message: "Marca modelo",
    success: true,
  });
}
