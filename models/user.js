import mongoose from "mongoose";
import argon2 from "argon2";
import {
  createTokenForUser,
  validateToken,
} from "../services/authentication.js";

// User collection: credentials + profile shown in the nav.
// password has select:false so it never appears in queries by default.
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatarURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true },
);

// Hash with argon2id whenever a new/changed password is saved.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await argon2.hash(this.password, {
    type: argon2.argon2id,
  });
});

/**
 * Looks up a user by email and verifies their password with argon2.
 * @param {String} email - Account email.
 * @param {String} password - Plaintext password from the signin form.
 * @returns {String|null} Signed JWT on success, null if email/password wrong.
 */
userSchema.statics.verifyPassword = async function (email, password) {
  const user = await this.findOne({ email }).select("+password");

  if (!user) {
    return null;
  }

  const isValid = await argon2.verify(user.password, password);

  if (!isValid) {
    return null;
  }

  const token = createTokenForUser(user);
  return token;
};

const User = mongoose.model("user", userSchema);

export default User;
