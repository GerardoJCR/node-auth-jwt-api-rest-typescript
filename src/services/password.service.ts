import bcrypt from "bcrypt";

const SALT_ROUNDS: number = 10;

export const hashedPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

//Leer y comparar
export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
