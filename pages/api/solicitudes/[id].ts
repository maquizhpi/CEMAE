import { NextApiRequest, NextApiResponse } from "next";
import read from "../../../controllers/mongo/solicitudes/read";
import remove from "../../../controllers/mongo/solicitudes/delete";
import dbConnect from "../../../database/connect/mongo";
import update from "../../../controllers/mongo/solicitudes/update";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // connect to the database
    await dbConnect();

    switch (req.method) {
      case "GET":
        return await read(req, res);
      case "DELETE":
        return await remove(req, res);
      case "PUT":
        return await update(req, res);
      default:
        throw new Error("Método no permitido");
    }
  } catch (error) {
    console.error(error);
    // return the error
    return res.status(500).json({
      message: new Error(error).message,
      success: false,
    });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
