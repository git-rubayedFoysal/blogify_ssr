import jwt from "jsonwebtoken";

/**
 * Creates a signed JWT access token for an authenticated user.
 * The token payload carries the fields the views need (name, avatar, role).
 * @param {Object} user - The user document from MongoDB.
 * @returns {String} Signed JWT, valid for 1 day.
 */
export const createTokenForUser = (user) => {
  const payload = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarURL: user.avatarURL,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY_FOR_ACCESS_TOKEN, {
    expiresIn: "1d",
  });

  return token;
};

/**
 * Verifies a JWT's signature and expiry.
 * Throws TokenExpiredError / JsonWebTokenError on failure - callers must catch.
 * @param {String} token - The raw JWT string from the accessToken cookie.
 * @returns {Object|null} Decoded payload, or null if the token is falsy.
 */
export const validateToken = (token) => {
  const payload = jwt.verify(token, process.env.SECRET_KEY_FOR_ACCESS_TOKEN);

  if (!payload) {
    return null;
  }

  return payload;
};
