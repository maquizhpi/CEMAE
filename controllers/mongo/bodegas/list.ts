import { NextApiRequest, NextApiResponse } from "next";
import { BodegaModel, HerramientaModel } from "../../../database/schemas";
import { Bodega, Herramienta } from "../../../models";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // fetch the posts
  const bodegas = await BodegaModel.find({})

  return res.status(200).json({
    message: "todas las bodegass",
    data: bodegas as Array<Bodega>,
    success: true,
  });
}