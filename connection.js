import mongoose from "mongoose";

/**
 * Opens the Mongoose connection to MongoDB and logs the result.
 * @param {String} connectionString - The MongoDB connection string.
 */

export const connectDB = async (connectionString) => {
  await mongoose.connect(connectionString);
  console.log("MongoDB connected Successfully!");
};
