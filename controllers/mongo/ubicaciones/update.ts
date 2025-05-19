import { NextApiRequest, NextApiResponse } from "next";
import { Ubicaciones } from "../../../models";
import FormatedDate from "../../utils/formated_date";
import { AuditoryModel, UbicacionesModel } from "../../../database/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const Ubicaciones = req.body as Ubicaciones;
  const userName = req.headers.username as string;

  const newUbicaciones = (): Ubicaciones => {
    return Ubicaciones;
  };

  const resp = await UbicacionesModel.findOneAndUpdate(
    {
      _id: Ubicaciones.id,
    },
    newUbicaciones()
  );

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Actualizo la Ubicacion:" + Ubicaciones.nombre,
  });
  await auditory.save();

  if (resp === null)
    return res.status(500).json({
      message: "Ubicacion no encontrada",
      success: false,
    });

  return res.status(200).json({
    message: "Ubicacion editada",
    success: true,
  });
}
