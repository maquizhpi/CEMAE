import { NextApiRequest, NextApiResponse } from "next";
import { ModeloHerramientaModel } from "../../../database/schemas";
import { ModelosHerramienta } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // fetch the posts
  const modelos = await ModeloHerramientaModel.find({});

  return res.status(200).json({
    message: "todos las marcas",
    data: modelos as Array<ModelosHerramienta>,
    success: true,
  });
}
