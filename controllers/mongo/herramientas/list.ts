import { NextApiRequest, NextApiResponse } from "next";
import { BodegaModel } from "../../../database/schemas";
import { Bodega } from "../../../models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const bodegas = await BodegaModel.find({}).lean();

    return res.status(200).json({
      message: "todas las bodegass",
      data: bodegas as Bodega[],
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener bodegas",
      success: false,
    });
  }
}
