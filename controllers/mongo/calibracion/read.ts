import { NextApiRequest, NextApiResponse } from "next";
import { CalibracionModel } from "../../../database/schemas";
import { Calibracion } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  // fetch the posts
  const solicitud = await CalibracionModel.findById(id);

  return res.status(200).json({
    message: "una solicitud de calibracion",
    data: solicitud as Calibracion,
    success: true,
  });
}
