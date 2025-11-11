import mongoose from "mongoose";
import env from "./env.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("✅ MongoDB connection established successfully.");
    
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected successfully.");
    });

  } catch (error) {
    console.error("❌ Unable to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default mongoose;
