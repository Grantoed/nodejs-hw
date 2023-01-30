const express = require("express");
const { asyncWrapper } = require("../helpers/apiHelpers");
const { authMiddleware } = require("../middlewares/authMiddleware");

const authRouter = express.Router();
const {
  registrationController,
  registrationResendController,
  loginController,
  logoutController,
  currentController,
  verificationController,
} = require("../controllers/authController");

authRouter.post("/registration", asyncWrapper(registrationController));
authRouter.post(
  "/registration/resend",
  asyncWrapper(registrationResendController)
);
authRouter.post("/login", asyncWrapper(loginController));
authRouter.post(
  "/verify/:verificationToken",
  asyncWrapper(verificationController)
);
authRouter.get("/logout", authMiddleware, asyncWrapper(logoutController));
authRouter.get("/current", authMiddleware, asyncWrapper(currentController));

module.exports = authRouter;
