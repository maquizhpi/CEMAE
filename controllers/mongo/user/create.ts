import { NextApiRequest, NextApiResponse } from "next";
import { UserModel, AuditoryModel } from "../../../database/schemas";
import { Usuario } from "../../../models";
import FormatedDate from "../../utils/formated_date";
import bcrypt from "bcryptjs"; // 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = req.body as Usuario;
    const userName = req.headers.username as string;

    //  1. Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(user.contraseña, 10);

    // 2. Crear usuario con contraseña cifrada
    const nuevoUsuario = new UserModel({
      ...user,
      contraseña: hashedPassword,
    });

    //  3. Guardar usuario
    await nuevoUsuario.save();

    //  4. Registrar auditoría
    const auditory = new AuditoryModel({
      date: FormatedDate(),
      user: userName,
      action: "Creó un Usuario: " + nuevoUsuario.name,
    });

    await auditory.save();

    return res.status(200).json({
      message: "Usuario Creado",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear usuario",
      success: false,
    });
  }
}
