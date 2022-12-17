import { Server, Socket } from "socket.io";
import AuthServer from "./auth";
import { signAuthToken } from "../utils/signAuthToken";

const authHandlers = (io: Server, socket: Socket, _auth: AuthServer) => {
  // const sender = socket.request["currentUser"].id;
  const socketId = socket.id;

  // login app handler
  socket.on("boltz@auth:request", () => {
    // socket.join(newAuthConn);
    const newAuthConnHash = _auth.registerAuthConnection(socketId);
    socket.emit("boltz@auth:init", newAuthConnHash);
  });

  // Boltz APP handlers

  const boltzAppInit = (connectionHash) => {
    if (!socket.request?.["currentUser"]) {
      throw new Error("Unauthorized!");
    }
    const connection = _auth.getConnectionByHash(connectionHash);
    socket.to(connection.socket).emit("boltz@auth:initialize");
  };

  const handleAppAuth = (connectionHash) => {
    try {
      if (!socket.request?.["currentUser"]) {
        throw new Error("Unauthorized!");
      }

      const connection = _auth.getConnectionByHash(connectionHash);
      const _token = signAuthToken(socket.request?.["currentUser"]);
      socket.to(connection.socket).emit("boltz@auth:login", _token);
      _auth.assignAuthUser({
        connection,
        user: socket.request?.["currentUser"],
        socketId,
      });
    } catch (error: any) {
      socket.emit("boltz@auth:failed", error.message || "Connection Failed!");
    }
  };

  const notifyAuthorized = (hash) => {
    // if (!socket.request?.["currentUser"]) {
    //   throw new Error("Unauthorized!");
    // }
    // fetch socket  ? who authorized
    let connection: any = _auth.getConnectionById(hash);
    if (!connection) connection = _auth.getConnectionByHash(hash);
    socket.to(connection?.user?.socket).emit("boltz@auth:authorized");
  };

  socket.on("boltz@auth:app_init", boltzAppInit);
  socket.on("boltz@auth:authenticate", handleAppAuth);
  socket.on("boltz@auth:authorized", notifyAuthorized);

  socket.on("disconnect", () => {
    _auth.removeConnection({ socketId });
  });
};

export default authHandlers;
