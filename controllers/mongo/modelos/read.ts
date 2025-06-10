import { NextApiRequest, NextApiResponse } from "next";
import { ModeloHerramientaModel } from "../../../database/schemas";
import { ModelosHerramienta } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  // fetch the posts
  const modelo = await ModeloHerramientaModel.findById(id);

  return res.status(200).json({
    message: "una marca",
    data: modelo as ModelosHerramienta,
    success: true,
  });
}
