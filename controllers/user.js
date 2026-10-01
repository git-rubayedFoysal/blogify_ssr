import User from "../models/user.js";
import { createTokenForUser } from "../services/authentication.js";

// Must match JWT expiresIn ("1d") in services/authentication.js
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

// module scaffolding
const user = {};

/**
 * GET /user/signin - renders the signin form.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
user.renderSigninPage = (req, res) => {
  return res.render("signin");
};

/**
 * GET /user/signup - renders the signup form.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
user.renderSignupPage = (req, res) => {
  return res.render("signup");
};

/**
 * POST /user/signup - creates a new account and logs the user in.
 * Password is hashed by the User pre-save hook (argon2).
 * Issues a JWT in an httpOnly cookie, then redirects to home.
 * @param {Object} req - Express request object (fullName, email, password in body).
 * @param {Object} res - Express response object.
 */
user.createUser = async (req, res) => {
  const { fullName, email, password } = req?.body;

  if (!fullName || !email || !password) {
    return res.status(400).render("signup", {
      error: "Invalid request, all fields are required!",
    });
  }

  const newUser = await User.create({
    fullName,
    email,
    password,
  });

  const accessToken = createTokenForUser(newUser);

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true, // not readable from client JS
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    })
    .redirect("/");
};

/**
 * POST /user/signin - verifies credentials and starts a session.
 * Returns 401 with the signin view on wrong email/password.
 * On success sets the accessToken cookie and redirects to home.
 * @param {Object} req - Express request object (email, password in body).
 * @param {Object} res - Express response object.
 */
user.authenticateUser = async (req, res) => {
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
      httpOnly: true, // not readable from client JS
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    })
    .redirect("/");
};

/**
 * GET /user/logout - clears the auth cookie and shows the signin page.
 * Note: the JWT itself stays valid until exp; no server-side revocation.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
user.logoutUser = (req, res) => {
  res.clearCookie("accessToken");

  res.render("signin");
};

// Named exports so routes/user.js can import individual handlers
export const {
  renderSigninPage,
  renderSignupPage,
  createUser,
  authenticateUser,
  logoutUser,
} = user;
