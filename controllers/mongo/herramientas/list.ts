import { NextApiRequest, NextApiResponse } from "next";
import { HerramientaModel } from "../../../database/schemas";
import { Herramienta } from "../../../models";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // fetch the posts
  const herramienta = await HerramientaModel.find({})

  return res.status(200).json({
    message: "todas las herramientas",
    data: herramienta as Array<Herramienta>,
    success: true,
  });
}