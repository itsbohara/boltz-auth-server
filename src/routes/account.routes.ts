import { Router } from "express";
import {
  currentUserHandler,
  refreshUserTokenHandler,
  userLoginHandler,
  userRegisterHandler,
  verifyAuthTokenHandler,
} from "../controllers/account.controller";
import { authorization } from "../common/middleware/authorization";
import { verifyToken } from "../common/middleware/jwt-validator";
import { requireAuthentication } from "../common/middleware/require-auth";
// import { checkDuplicateEmail } from "../middleware/verifySignUp";

const router = Router();

const authAreaHandler = [verifyToken, requireAuthentication];

// ! only for testing
router.get("/protected", authAreaHandler, (req, res) => {
  res.json({
    message: "You can't access this route without successfull authorization.",
  });
});

router.get("/me", authAreaHandler, currentUserHandler);
router.get("/refresh", authAreaHandler, refreshUserTokenHandler);

router.post("/login", userLoginHandler);
router.post("/verify", verifyToken, verifyAuthTokenHandler);
router.post("/register", userRegisterHandler);
// router.post("/reset-password", userController.resetPassword);

// router.post("/register", checkDuplicateEmail, userController.registerUser);

export default router;
