import mongoose from "mongoose";

// MONGODB_URI will be validated during connectDB()
const getMongoUri = () => process.env.MONGODB_URI as string;

declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise || mongoose.connection.readyState === 0) {
    const uri = getMongoUri();
    if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');
    
    // Serverless-optimized connection options to withstand 10k+ sudden spikes
    // without exhausting Atlas connection limits
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Avoid pool exhaustion when dozens of serverless instances spin up
      minPoolSize: 0,  // Drop idle connections when traffic subsides
      serverSelectionTimeoutMS: 5000, // Fail fast if cluster is overloaded
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      family: 4, // IPv4 fast resolution
    };
    cached.promise = mongoose.connect(uri, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}
