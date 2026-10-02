import mongoose from "mongoose";

/**
 * Opens the Mongoose connection to MongoDB and logs the result.
 * @param {String} connectionString - The MongoDB connection string.
 */

export const connectDB = async (connectionString) => {
  try {
    await mongoose.connect(connectionString);
    console.log("MongoDB connected Successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
