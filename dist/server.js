"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const specs_1 = __importDefault(require("./routes/specs"));
const health_1 = __importDefault(require("./routes/health"));
const db_1 = require("./lib/db");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 8080;
// Connect to MongoDB with error handling
(0, db_1.connectDB)().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    console.log('Server will continue with mock storage');
});
const ALLOWED_ORIGINS = [
    "https://marketing-mauve-ten.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
];
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        // allow curl/server-to-server with no Origin, and allow listed origins
        if (!origin || ALLOWED_ORIGINS.includes(origin))
            return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // REMOVE allowedHeaders so cors echoes Access-Control-Request-Headers automatically
    credentials: false, // set to true only if you send cookies
}));
// Preflight for all routes
app.options("*", (0, cors_1.default)());
app.use(express_1.default.json({ limit: "2mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health AFTER cors so it gets CORS headers
app.get("/health", (_req, res) => res.status(200).send("ok"));
// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
// Mount API routes under /api
app.use("/api/specs", specs_1.default);
app.use(health_1.default);
// 404 handler for API routes
app.use("/api/*", (_req, res) => res.status(404).json({ message: "Not Found" }));
// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    const code = Number(err?.status || err?.statusCode || 500);
    res.status(code).json({ message: err?.message || "Server error" });
});
// Start the server on 0.0.0.0 for Railway
app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
exports.default = app;
