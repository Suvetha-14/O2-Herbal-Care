import mongoose from "mongoose";

const connectDB = async () => {
  // Attempt to connect to MongoDB. Throw on failure so server doesn't run without DB.
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    writeConcern: { w: 1 }, // Use w=1 instead of w=majority
    retryWrites: false, // Disable retryWrites if it causes issues
  });

  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

export default connectDB;