import { NextApiRequest, NextApiResponse } from "next";
import { SolicitudeModel } from "../../../database/schemas";
import { Solicitude } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const solicitude = await 
  SolicitudeModel.find({}).lean();

  return res.status(200).json({
    message: "todas las solicitudes",
    data: solicitude,
    success: true,
  });
}
