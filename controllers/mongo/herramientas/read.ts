import { NextApiRequest, NextApiResponse } from "next";
import { HerramientaModel } from "../../../database/schemas";
import { Herramienta } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  // fetch the posts
  const herramienta = await HerramientaModel.findById(id);

  return res.status(200).json({
    message: "una herramienta",
    data: herramienta as Herramienta,
    success: true,
  });
}
