import application from "./src/application";
import http from "http";
import AuthServer from "./src/sockets/auth";

const PORT = process.env.PORT;
((): void => {
  const server = http.createServer(application!);

  /// websocket servers
  new AuthServer(server);

  // no need to listen on serverless //
  server.listen(PORT, (): boolean =>
    process.stdout.write(
      `⚡️[Bolz.Auth]: Server is running at http://localhost:${PORT}\n`
    )
  );
})();
