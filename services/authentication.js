import jwt from "jsonwebtoken";

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

export const validateToken = (token) => {
  const payload = jwt.verify(token, process.env.SECRET_KEY_FOR_ACCESS_TOKEN);

  return payload;
};
