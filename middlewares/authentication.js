import { validateToken } from "../services/authentication.js";

/**
 * Global auth middleware (registered in index.js).
 * Reads the accessToken cookie, verifies it, and attaches req.user when valid.
 * Expired or malformed tokens are treated as anonymous: the cookie is cleared
 * and the request continues without req.user (so the nav shows "Sign In").
 * Unexpected errors are forwarded to the error handler.
 */
export const checkAuthentication = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next();
  try {
    const user = validateToken(token);
    req.user = user;
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      res.clearCookie("accessToken", { path: "/" });
      return next();
    }
    return next(error);
  }
  return next();
};

/**
 * Route guard for pages/actions that require a logged-in user.
 * Must run after checkAuthentication so req.user is already set.
 * Redirects anonymous visitors to the signin page.
 */
export const requiredAuth = (req, res, next) => {
  if (!req.user) return res.redirect("/user/signin");

  return next();
};
