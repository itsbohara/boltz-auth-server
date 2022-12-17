import { Server, Socket } from "socket.io";
import uuidv4 from "../utils/uuidv4";
import authHandlers from "./authHandler";
import { socketSession } from "./socketJWTSession";
import bcrypt from "bcryptjs";

interface User {
  id: string;
  socket: string;
}

interface Connection {
  id: string;
  socket: string;
  hash: string;
  user?: User; // remote authorizing boltz user
}

class AuthServer {
  private server: Server;
  private httpServer?: any;
  //   public connections: IDSeparatedData = { byId: {}, allIds: [] };
  public connections: Connection[] = [];

  public constructor(httpServer) {
    this.httpServer = httpServer;
    this.initialize()
      .then(() => process.stdout.write("- Boltz Auth Server started\n"))
      .catch((err) => {
        process.stderr.write(err.message);
        process.exit(1);
      });
  }

  protected async initialize(): Promise<void> {
    this.server = new Server(this.httpServer, {
      cors: {
        //     origin: "https://example.com",
        origin: "*",
        //     methods: ["GET", "POST"],
      },
      // cors Security
      //   allowRequest: (req, callback) => {
      //     const noOriginHeader = req.headers.origin === undefined;
      //     callback(null, noOriginHeader);
      //   }
    });

    this.server.use(socketSession);

    this.server.on("connection", (socket) => {
      socket.on("ping", () => socket.emit("pong"));

      authHandlers(this.server, socket, this);
    });
  }

  public registerAuthConnection(socketId) {
    let connection: Connection;
    connection = this.connections.find((c) => c.socket == socketId)!;
    if (connection) this.connections.filter((c) => c.socket !== socketId);
    const newConn: Connection = {
      id: uuidv4(),
      socket: socketId,
      hash: bcrypt.hashSync(socketId),
    };
    this.connections.push(newConn);
    return newConn.hash;
  }

  public removeConnection({ socketId }) {
    this.connections = this.connections.filter((c) => c.socket !== socketId);
  }

  public getConnectionById(id) {
    const connection = this.connections.find((c) => c.id == id);
    // if (!connection) throw new Error("Requested login can't authenticate!");
    return connection;
  }

  public getConnectionByHash(hash) {
    const connection = this.connections.find((c) => c.hash == hash);
    if (!connection) throw new Error("Requested login can't authenticate!");

    if (!bcrypt.compareSync(connection.socket, hash)) {
      throw new Error("Invalid login attempt!");
    }
    return connection;
  }

  public assignAuthUser({ connection, user, socketId }) {
    const assignedConnection = {
      ...connection,
      user: {
        id: user.id,
        socket: socketId,
      },
    };
    // can@update : another way idSeparated data
    const _connections = this.connections.filter((c) => c.id !== connection.id);
    this.connections = [..._connections, assignedConnection];
  }
}

export default AuthServer;
