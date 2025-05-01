import mongoose from "mongoose";

const getMongoDBURI = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("⛔⛔MONGODB_URI is not defined in .env file⛔⛔");
  }

  return process.env.MONGODB_URI;
};

export const connectToMongoDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_USERNAME || !process.env.MONGODB_PASSWORD) {
    throw new Error(
      "⛔⛔DB Authentication info is not defined in .env file⛔⛔"
    );
  }

  try {
    await mongoose.connect(getMongoDBURI(), {
      user: process.env.MONGODB_USERNAME,
      pass: process.env.MONGODB_PASSWORD,
      retryWrites: true,
      writeConcern: { w: "majority" },
      dbName: process.env.MONGODB_DATABASE,
      appName: process.env.MONGODB_DATABASE ?? "",
    });
  } catch (error) {
    console.error("📕📕MongoDB connection error:", error);
  }
};
