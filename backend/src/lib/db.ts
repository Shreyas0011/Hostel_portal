import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    throw new Error('MONGODB_URI environment variable is required to start the Hostel Portal backend.');
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      dbName: process.env.DB_NAME || 'hostel_portal',
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed on app termination');
  process.exit(0);
});

export default mongoose;
