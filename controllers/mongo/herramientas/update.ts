import { NextApiRequest, NextApiResponse } from "next";
import { Herramienta } from "../../../models";
import FormatedDate from "../../utils/formated_date";
import { AuditoryModel, HerramientaModel } from "../../../database/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const herramienta = req.body as Herramienta;
  const userName = req.headers.username as string;

  const newherramienta = (): Herramienta => {
    return herramienta;
  };

  const resp = await HerramientaModel.findOneAndUpdate(
    {
      _id: herramienta.id,
    },
    { $set: newherramienta() },
    { new: true }
  );

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Actualizo la herramienta:" + herramienta.nombre,
  });
  await auditory.save();

  if (resp === null)
    return res.status(500).json({
      message: "herramienta no encontrada",
      success: false,
    });

  return res.status(200).json({
    message: "herramienta editada",
    success: true,
  });
}
