import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import specsRoutes from './routes/specs';
import healthRoutes from './routes/health';
import { connectDB } from './lib/db';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Connect to MongoDB with error handling
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.log('Server will continue with mock storage');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - Production frontend origin
const FRONTEND_ORIGIN = 'https://marketing-mauve-ten.vercel.app';

// Custom CORS middleware to ensure consistent headers
const corsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Set CORS headers for the production frontend
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

// Apply CORS middleware to all routes
app.use(corsMiddleware);

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use(specsRoutes);
app.use(healthRoutes);

// 404 handler with CORS headers
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Ensure CORS headers are set on 404 responses
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');
  
  res.status(404).json({ 
    ok: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware with CORS headers
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  // Ensure CORS headers are set on error responses
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');
  
  res.status(500).json({ 
    ok: false, 
    message: err.message || 'Internal Server Error' 
  });
});

// Start the server on 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
  console.log(`Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});

export default app;