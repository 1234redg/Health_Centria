import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
