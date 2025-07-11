import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../database/connect/mongo";
import { HerramientaModel } from "../../../database/schemas";
import { Herramienta } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // fetch the posts
  const bodegas = await HerramientaModel.find({})

  return res.status(200).json({
    message: "todas las bodegass",
    data: bodegas as Array<Herramienta>,
    success: true,
  });
}