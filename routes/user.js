import express from "express";
import {
  renderSigninPage,
  renderSignupPage,
  createUser,
  authenticateUser,
  logoutUser,
} from "../controllers/user.js";

// Thin router: all handler logic lives in controllers/user.js
const router = express.Router();

// Auth pages (public)
router.get("/signin", renderSigninPage);
router.get("/signup", renderSignupPage);

// Auth actions (public)
router.post("/signup", createUser);
router.post("/signin", authenticateUser);

// Session teardown - clears the accessToken cookie
router.get("/logout", logoutUser);

export default router;
