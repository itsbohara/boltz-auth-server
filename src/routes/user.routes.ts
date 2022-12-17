import { Router } from "express";
import {} from "../controllers/account.controller";
import { authorization } from "../common/middleware/authorization";
import { verifyToken } from "../common/middleware/jwt-validator";
import { requireAuthentication } from "../common/middleware/require-auth";
// import { checkDuplicateEmail } from "../middleware/verifySignUp";

const router = Router();

const adminAreaHandler = [
  verifyToken,
  requireAuthentication,
  authorization(["admin"]),
];

// ! only for testing
router.get("/protected", adminAreaHandler, (req, res) => {
  res.json({
    message: "Admin Area",
  });
});

// admin routes
// router.get("/users", adminAreaHandler, userController.getUsers);
// router.get("/users/:id", adminAreaHandler);
// router.patch("/users/:id", adminAreaHandler, userController.updateUser);
// router.delete("/users/:id", adminAreaHandler, userController.deleteUser);

export default router;
