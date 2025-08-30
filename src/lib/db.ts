import mongoose from 'mongoose';

let _conn: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (_conn) return _conn;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB] MONGODB_URI missing, using mock storage');
    return null;
  }
  
  _conn = mongoose.connect(uri, { 
    serverSelectionTimeoutMS: 7000 
  });
  
  try {
    await _conn;
    console.log('[DB] Connected to MongoDB');
    return _conn;
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    _conn = null;
    return null;
  }
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
