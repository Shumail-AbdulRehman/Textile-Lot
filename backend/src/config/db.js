import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/textile_lot_serials';

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

export default connectDB;
