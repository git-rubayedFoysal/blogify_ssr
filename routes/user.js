import express from "express";
import User from "../models/user.js";
import { createTokenForUser } from "../services/authentication.js";
const router = express.Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req?.body;

  if (!fullName || !email || !password) {
    return res.status(400).render("signup", {
      error: "Invalid request, all fields are required!",
    });
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });

  const accessToken = createTokenForUser(user);

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    })
    .redirect("/");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req?.body;

  if (!email || !password) {
    return res.status(400).render("signin", {
      error: "Invalid request, all fields are required!",
    });
  }
  const accessToken = await User.verifyPassword(email, password);

  if (!accessToken) {
    return res.status(401).render("signin", {
      error: "Invalid email or password",
    });
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    })
    .redirect("/");
});

router.get("/logout", (req, res) => {
  res.clearCookie("accessToken");

  res.render("signin");
});

export default router;
