import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../common/errors/bad-request-error";
import { UnauthorizedError } from "../common/errors/unauthorized-error";

import { userModel } from "../models/user.model";
import bcrypt from "bcryptjs";

import { generateFromEmail } from "unique-username-generator";
import { signAuthToken } from "../utils/signAuthToken";

const generateVerificationCode = () =>
  Math.floor(Math.random() * 99999 + 99999);

export const userLoginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      next(new BadRequestError("Invalid input!"));
      return;
    }

    const existUser = await userModel.findOne({ email });
    if (!existUser || !existUser?.comparePassword(password)) {
      next(new UnauthorizedError("Invalid credentials!"));
      return;
    }

    const userJwt = signAuthToken(existUser);

    const _code = generateVerificationCode();

    // TODO: email -> verification code
    console.log("Email Verification code - " + _code);

    existUser!.emailAuthToken = bcrypt.hashSync(_code.toString());
    existUser.save();

    return res.json({ _token: userJwt, verify: true });
  } catch (error: any) {
    next(new UnauthorizedError(error.message || "Invalid credentials!"));
  }
};

export const userRegisterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, username, name } = req.body;
  if (!email || !name) {
    next(new BadRequestError("Invalid input!"));
    return;
  }

  try {
    let _username = username;
    if (!username && name) _username = await generateUsername(name);

    await userModel.create({
      name,
      email,
      username: _username,
      password: bcrypt.hashSync(password),
      role: "user",
    });
    res.json({ success: 1 });
  } catch (error: any) {
    if (error?.keyPattern?.email == 1) {
      next(new BadRequestError("Account already exits with provided email!"));
    } else next(new BadRequestError("Account creation failed!"));
  }
};

export const currentUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.send({ currentUser: req._user });
};

export const verifyAuthTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { verification } = req.body;
  if (!verification) {
    next(new BadRequestError("Invalid input!"));
    return;
  }
  try {
    const user = await userModel.findById(req["currentUser"]!.id);
    if (!user?.emailAuthToken) throw new BadRequestError();

    if (!user?.verifyAuthToken(verification)) {
      throw new BadRequestError("Invalid verification code!");
    }

    user!.emailAuthToken = undefined;
    await user?.save();

    res.json({ verified: true });
  } catch (error) {
    next(error);
  }
};

// fetch new token for authentication

export const refreshUserTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.currentUser;
    if (!user) {
      next(new UnauthorizedError("Not authorized!"));
      return;
    }
    const userJwt = signAuthToken(user);
    return res.json({ _token: userJwt });
  } catch (error: any) {
    next(new UnauthorizedError("Token generation failed!"));
  }
};

// generate username based on name with validating
interface optionalParams {
  useShuffix?: boolean;
  fromEmail?: boolean;
}
const generateUsername = async (name: string, params?: optionalParams) => {
  let username = name.trim().toLowerCase().replaceAll(" ", "-");
  let suffix = Math.floor(Math.random() * 998 + 1); //@Boltz:v1-upto 1000 same kind of username
  if (params?.fromEmail) username = generateFromEmail(name, 4);
  if (params?.useShuffix && !params?.fromEmail) username += `-${suffix}`;
  const existUser = await userModel.findOne({ username });
  if (!existUser) return username;
  generateUsername(name, {
    fromEmail: params?.fromEmail!,
    useShuffix: params?.useShuffix!,
  });
};
