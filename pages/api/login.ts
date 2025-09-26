import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../database/connect/mongo";
import { UserModel } from "../../database/schemas";
import { Usuario } from "../../models";
import sanitize from "mongo-sanitize";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Método no permitido", success: false });
    }
    // 1. Sanitizar entradas
    const correo = sanitize(req.body.correo);
    const contraseña = sanitize(req.body.contraseña);
    // 2. Validar tipo de datos
    if (typeof correo !== "string" || typeof contraseña !== "string") {
      return res.status(400).json({ message: "Datos inválidos", success: false });
    }
    // 3. Buscar usuario por correo
    const user = await UserModel.findOne({ correo });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado", success: false });
    }
    // 4. Verificar contraseña con bcrypt
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta", success: false });
    }
    // 5. Eliminar la contraseña antes de responder
    const { contraseña: _, ...userData } = user.toObject();
    return res.status(200).json({
      message: "Bienvenido!",
      data: userData as Usuario,
      success: true,
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      message: "Error en el servidor",
      success: false,
    });
  }
}
