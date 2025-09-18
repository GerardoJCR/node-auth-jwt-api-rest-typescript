import { Request, Response } from "express";
import { comparePasswords, hashedPassword } from "../services/password.service";
import prisma from "../models/user";
import { generatetoken } from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email) {
      res.status(400).json({
        message: "El email es obligatorio",
      });
    }

    if (!password) {
      res.status(400).json({
        message: "La contraseña es obligatoria",
      });
    }

    const hashPassword = await hashedPassword(password);
    console.log(hashPassword);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });
    //token
    const token = generatetoken(user);
    res.status(201).json({ token });
    //
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({
        message: "El email ingresado ya existe",
      });
    }

    console.log(error);
    res.status(500).json({ error: "Hubo un error en el registro" });
  }
};

//login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email) {
      res.status(400).json({ message: "El email es obligatorio" });
      return;
    }

    if (!password) {
      res.status(400).json({ message: "La contraseña es obligatoria" });
      return;
    }

    // 👇 Aquí ya puedes usar prisma.user sin error
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: "Usuario y contraseña no coinciden" });
      return;
    }

    const token = generatetoken(user);
    res.status(200).json({ token });
  } catch (error: any) {
    console.log("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
