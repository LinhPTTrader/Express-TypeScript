import bcrypt from "bcrypt";

const saltRounds = 10;


export const HashPassword = (password: string) => {
    const hash = bcrypt.hashSync(password, saltRounds);
    return hash;
}