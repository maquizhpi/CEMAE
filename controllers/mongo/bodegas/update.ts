import { NextApiRequest, NextApiResponse } from "next";
import { Bodega } from "../../../models";
import FormatedDate from "../../utils/formated_date";
import { AuditoryModel, BodegaModel,  } from "../../../database/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const bodega = req.body as Bodega; /// 
  const userName = req.headers.username as string;

  const newbodega = (): Bodega => {
    return bodega;
  };

  const resp = await BodegaModel.findOneAndUpdate(
    {
      _id: bodega.id,
    },
    newbodega()
  );

  const auditory = new AuditoryModel({
    date: FormatedDate(),
    user: userName,
    action: "Actualizo a la bodega:" + bodega.number,
  });
  await auditory.save();

  if (resp === null)
    return res.status(500).json({
      message: "bodega no encontrada",
      success: false,
    });

  return res.status(200).json({
    message: "bodega editada",
    success: true,
  });
}