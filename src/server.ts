import express from "express";
import cors from "cors";
import specsRouter from "./routes/specs.js"; // IMPORTANT: .js with NodeNext

const app = express();

const ALLOWED_ORIGINS = [
  "https://marketing-mauve-ten.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080"
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
}));
app.options("*", cors());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// DEBUG: log every API call to verify paths/methods in Railway logs
app.use("/api", (req, _res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", (_req, res) => res.status(200).send("ok"));

// ✅ Mount router here
app.use("/api/specs", specsRouter);

// Return useful 404 for unknown API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "No route", method: req.method, path: req.originalUrl });
});

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
