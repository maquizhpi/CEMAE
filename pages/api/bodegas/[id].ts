import { NextApiRequest, NextApiResponse } from "next";
import read from "../../../controllers/mongo/bodegas/read";
import remove from "../../../controllers/mongo/bodegas/delete";
import dbConnect from "../../../database/connect/mongo";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();

    switch (req.method) {
      case "GET":
        return await read(req, res);
      case "DELETE":
        return await remove(req, res);       
      default:     
        return res.status(405).json({
          message: "Método no permitido",
          success: false,
        });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: new Error(error).message,
      success: false,
    });
  }
}
