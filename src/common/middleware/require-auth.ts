import { Request, Response, NextFunction } from "express";
import { userModel } from "../../models/user.model";
import { UnauthorizedError } from "../errors/unauthorized-error";
export const requireAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req["currentUser"]) {
    next(new UnauthorizedError("Not authorized!"));
    return;
    // return res.status(401).json({ error: "Not authorized!" });
  }
  const projection = {
    name: 1,
    username: 1,
    email: 1,
    emailVerified: 1,
    role: 1,
    profile: 1,
    emailAuthToken: 1,
  };
  const user = await userModel.findById(req["currentUser"].id, projection);

  if (!user) {
    next(new UnauthorizedError("Invalid User!"));
    return;
  }

  if (user.emailAuthToken) {
    next(new UnauthorizedError("Invalid Authentication!"));
    return;
  }

  req["_user"] = user;
  next();
};
