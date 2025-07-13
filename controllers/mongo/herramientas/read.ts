import { NextApiRequest, NextApiResponse } from "next";
import { HerramientaModel } from "../../../database/schemas";
import { Herramienta } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  // fetch the posts
  const modelo = await HerramientaModel.findById(id);

  return res.status(200).json({
    message: "una marca",
    data: modelo as Herramienta,
    success: true,
  });
}
