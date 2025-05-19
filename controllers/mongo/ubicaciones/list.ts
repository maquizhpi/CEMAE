import { NextApiRequest, NextApiResponse } from "next";
import { UbicacionesModel } from "../../../database/schemas";
import { Ubicaciones } from "../../../models";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // fetch the posts
  const Ubicaciones = await UbicacionesModel.find({})

  return res.status(200).json({
    message: "todas las Ubicaciones",
    data: Ubicaciones as Array<Ubicaciones>,
    success: true,
  });
}