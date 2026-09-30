import { validateToken } from "../services/authentication.js";

export const checkAuthentication = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next();
  const user = validateToken(token);
  if (!user) return next();

  req.user = user;
  next();
};
