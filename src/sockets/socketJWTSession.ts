import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const socketSession = (socket: Socket, next) => {
  if (!(socket.request.headers && socket.request.headers.authorization)) {
    // next(new Error("Missing Authorization Token"));
    next();
    return;
  }

  const jwtToken = socket.request.headers.authorization?.split(" ")[1];
  try {
    const payload = jwt.verify(jwtToken!, process.env.JWT_ENCRYPTION_KEY!);
    // req!["currentUser"] = payload;
    socket.request["currentUser"] = payload;
    next();
  } catch (err) {
    // socket.disconnect();
    // next(new Error("Invalid Authorization Token!"));
    next();
  }
};
