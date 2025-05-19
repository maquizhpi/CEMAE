import { NextApiRequest, NextApiResponse } from "next";
import { BodegaModel } from "../../../database/schemas";
import { Bodega } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id as string;

  // fetch the posts
  const bodega = await BodegaModel.findById(id);

  return res.status(200).json({
    message: "una bodega",
    data: bodega as Bodega,
    success: true,
  });
}
