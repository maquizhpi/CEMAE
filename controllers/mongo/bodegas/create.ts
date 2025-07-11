import { NextApiRequest, NextApiResponse } from "next";
import {
  AuditoryModel,
  BackupBodegaModel,
  BodegaModel,
} from "../../../database/schemas"; 
import { Bodega } from "../../../models";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bodega = req.body as Bodega;
  const userName = req.headers.username as string;
  const count: number = await BackupBodegaModel.countDocuments();
  // fetch the posts
  const bodegapost = new BodegaModel({ ...bodega, number: count + 1 });

  await bodegapost.save();

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Creo una bodega: " + bodegapost.number,
  });
  await auditory.save();

  const backup = new BackupBodegaModel({ bodega: bodegapost._id });

  await backup.save();

  return res.status(200).json({
    message: "bodega Creada",
    success: true,
  });
}