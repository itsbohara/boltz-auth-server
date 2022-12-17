import { sign } from "jsonwebtoken";
export const signAuthToken = (user) => {
  return sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_ENCRYPTION_KEY!,
    {
      expiresIn: "10days",
    }
  );
};
