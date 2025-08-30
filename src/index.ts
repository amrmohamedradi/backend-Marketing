import express from 'express';
import { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON bodies
app.use(express.json());

// CORS Configuration
const FRONTEND_ORIGIN = 'https://marketing-mauve-ten.vercel.app';

// Global CORS middleware
const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};

// Apply CORS to all routes
app.use(corsMiddleware);

// Example route: POST /api/specs/:id
app.post('/api/specs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  
  console.log(`Received POST for spec: ${id}`, payload);
  
  // Your business logic here
  res.json({
    success: true,
    id,
    message: 'Spec updated successfully',
    data: payload
  });
});

// Example route: GET /api/specs/:id
app.get('/api/specs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    id,
    data: {
      name: `Spec ${id}`,
      created: new Date().toISOString()
    }
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler with CORS headers
app.use((req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');
  
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler with CORS headers
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Vary', 'Origin');
  
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Listen on 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

export default app;
