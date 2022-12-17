import { Router } from "express";

import { NotFoundError } from "../common/errors/not-found-error";
import { errorHandler } from "../common/middleware/error-handler";

//routes
import AccountRoutes from "./account.routes";
import UserRoutes from "./user.routes";

const Routes = Router();

//routes
Routes.use("/api/account", AccountRoutes);
Routes.use("/api", UserRoutes);

Routes.all("/", async (req, res) => {
  res.send({
    server: {
      name: "Boltz Auth System",
      status: "Running",
      version: process.env.npm_package_version ?? "1.0.2",
      nodeVersion: `NodeJS - ${process.versions.node}`,
    },
  });
});

Routes.get("/ping", (req, res) => res.send("Pong"));

Routes.all("*", (req, res) => {
  throw new NotFoundError();
});

Routes.use(errorHandler);

export default Routes;
