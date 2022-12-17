import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized-error";

export interface UserPayload {
  id: string;
  email: string;
  iat: string;
  exp: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
      // _user?: UserDoc;
      _user?: any;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req.headers && req.headers.authorization)) {
    next(new UnauthorizedError("Missing Authorization Token"));
    return;
  }
  const jwtToken = req.headers.authorization.split(" ")[1];
  if (!jwtToken || jwtToken.trim() == "") {
    next(new UnauthorizedError("Missing Authorization Token"));
    return;
  }

  try {
    const payload = jwt.verify(
      jwtToken,
      process.env.JWT_ENCRYPTION_KEY!
    ) as unknown as UserPayload;

    req!["currentUser"] = payload;
  } catch (err) {
    console.log("validation error ");
    console.log(err);
    next(new UnauthorizedError("Invalid Authorization Token!"));
  }
  next();
};
