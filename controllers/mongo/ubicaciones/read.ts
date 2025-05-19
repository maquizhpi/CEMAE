import { NextApiRequest, NextApiResponse } from "next";
import { UbicacionesModel } from "../../../database/schemas";
import { Ubicaciones } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  // fetch the posts
  const Ubicaciones = await UbicacionesModel.findById(id);

  return res.status(200).json({
    message: "una Ubicaciones",
    data: Ubicaciones as Ubicaciones,
    success: true,
  });
}
