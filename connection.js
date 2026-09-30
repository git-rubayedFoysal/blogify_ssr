import mongoose from "mongoose";

/**
 * Provide MongoDB connection string for connect database.
 * @param {String} connectionString - The MongoDB connection string.
 */

export const connectDB = async (connectionString) => {
  await mongoose.connect(connectionString);
  console.log("MongoDB connected Successfully!");
};
