import { NextApiRequest, NextApiResponse } from "next";
import read from "../../../controllers/mongo/modelos/read";
import remove from "../../../controllers/mongo/modelos/delete";
import dbConnect from "../../../database/connect/mongo";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    switch (req.method) {
      case "GET":
        return await read(req, res);
      case "DELETE":
        return await remove(req, res);
      default:
        throw new Error("Método no permitido");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: new Error(error).message,
      success: false,
    });
  }
}
