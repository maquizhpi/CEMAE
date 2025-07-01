import { NextApiRequest, NextApiResponse } from "next";
import { BodegaModel} from "../../../database/schemas";
import { Bodega} from "../../../models";


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