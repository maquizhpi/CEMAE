import { NextApiRequest, NextApiResponse } from "next";
import { ModelosHerramienta } from "../../../models";
import FormatedDate from "../../utils/formated_date";
import { AuditoryModel, ModeloHerramientaModel } from "../../../database/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const modelos = req.body as ModelosHerramienta;
  const userName = req.headers.username as string;

  const newmodelos = (): ModelosHerramienta => {
    return modelos;
  };

  const resp = await ModeloHerramientaModel.findOneAndUpdate(
    {
      _id: modelos.id,
    },
    newmodelos()
  );

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Actualizo el modelo:" + modelos.nombre,
  });
  await auditory.save();

  if (resp === null)
    return res.status(500).json({
      message: "Modelo no encontrada",
      success: false,
    });

  return res.status(200).json({
    message: "Modelo editado",
    success: true,
  });
}
