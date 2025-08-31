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

const ALLOWED_ORIGINS = [
  "https://marketing-mauve-ten.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, cb) => {
    // allow curl/server-to-server with no Origin, and allow listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: false, // set to true only if you send cookies
}));

// Preflight for all routes
app.options("*", cors());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Health AFTER cors so it gets CORS headers
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
