import { NextApiRequest, NextApiResponse } from "next";
import { SolicitudeModel } from "../../../database/schemas";
import { Solicitude } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  // fetch the posts
  const solicitud = await SolicitudeModel.findById(id);

  return res.status(200).json({
    message: "una solicitud",
    data: solicitud as Solicitude,
    success: true,
  });
}
