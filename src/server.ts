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
const PORT = Number(process.env.PORT) || 8080;

// Connect to MongoDB with error handling
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.log('Server will continue with mock storage');
});

// CORS configuration with multiple origins
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173", 
    "https://marketing-mauve-ten.vercel.app",
    "https://your-frontend-domain.com"
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Health endpoint
app.get("/health", (_req, res) => res.status(200).send("ok"));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mount API routes under /api
app.use("/api/specs", specsRoutes);
app.use(healthRoutes);

// 404 handler for API routes
app.use("/api/*", (_req, res) => res.status(404).json({ message: "Not Found" }));

// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const code = Number(err?.status || err?.statusCode || 500);
  res.status(code).json({ message: err?.message || "Server error" });
});

// Start the server on 0.0.0.0 for Railway
app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));

export default app;