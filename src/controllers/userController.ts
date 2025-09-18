import { Request, Response } from "express";
import { hashedPassword } from "../services/password.service";
import prisma from "../models/user";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

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
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
      },
    });
    res.status(201).json(user);
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({
        message: "El email ingresado ya existe",
      });
    }

    console.log(error);
    res.status(500).json({ error: "Hubo un error pruebe mas tarde" });
  }
};

export const getAllUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error pruebe mas tarde" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).json({ error: "El usuario no fue encontrado" });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Hubo un error pruebe mas tarde" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id);
  const { password, email } = req.body;

  try {
    let dataToUpdate: any = { ...req.body };

    if (password) {
      const hashPassword = await hashedPassword(password);
      dataToUpdate.password = hashPassword;
    }

    if (email) {
      dataToUpdate.email = email;
    }
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: dataToUpdate,
    });

    res.status(200).json(user);
  } catch (error: any) {
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({
        message: "El email ingresado ya existe",
      });
    } else if (error?.code == "P2025") {
      res.status(404).json("Usuario no encontrado");
    } else {
      console.log(error);
      res.status(500).json({ error: "Hubo un error pruebe mas tarde" });
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id);
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    res.status(200).json({
      error: `El usuario ${userId} ha sido eliminado exitosamente`,
    });
  } catch (error: any) {
    if (error?.code == "P2025") {
      res.status(404).json("Usuario no encontrado");
    } else {
      console.log(error);
      res.status(500).json({ error: "Hubo un error pruebe mas tarde" });
    }
  }
};
