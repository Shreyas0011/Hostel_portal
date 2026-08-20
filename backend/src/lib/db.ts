import mongoose from 'mongoose';
import dns from 'dns';

if (dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
    // Ignore
  }
}

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    throw new Error('MONGODB_URI environment variable is required to start the Hostel Portal backend.');
  }

  const targetDbName = process.env.DB_NAME || 'hostel_portal';
  console.log(`Connecting to MongoDB Atlas (DB: ${targetDbName})...`);

  let lastError: any = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const conn = await mongoose.connect(mongoURI, {
        dbName: targetDbName,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
      });
      console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
      return;
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Connection attempt ${attempt}/3 failed: ${error.message}`);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  console.error('❌ MongoDB connection failed after 3 attempts:', lastError?.message);
  throw new Error(`MongoDB connection failed: ${lastError?.message}`);
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed on app termination');
  process.exit(0);
});

export default mongoose;
