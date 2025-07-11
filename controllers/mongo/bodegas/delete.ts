import { NextApiRequest, NextApiResponse } from "next";
import {
    AuditoryModel,
    BackupBodegaModel,
    BodegaModel,
} from "../../../database/schemas";
import FormatedDate from "../../utils/formated_date";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { _id } = req.body; 
    const userName = req.headers.username as string;

    // Buscar la bodega
    const bodega = await BodegaModel.findById(_id);
    if (!bodega) {
        return res.status(404).json({
            message: "Bodega no encontrada",
            success: false,
        });
    }

    // Hacer backup antes de eliminar
    const backup = new BackupBodegaModel({ bodega: bodega._id });
    await backup.save();

    // Eliminar la bodega
    await BodegaModel.deleteOne({ _id });

    // Registrar en auditoría
    const auditory = new AuditoryModel({
        date: FormatedDate(),
        user: userName,
        action: "Eliminó la bodega: " + bodega.number,
    });
    await auditory.save();

    return res.status(200).json({
        message: "Bodega eliminada",
        success: true,
    });
}