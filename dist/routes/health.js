"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const package_json_1 = __importDefault(require("../../package.json"));
const router = express_1.default.Router();
// GET /health - Health check endpoint
router.get('/health', async (req, res) => {
    const startTime = Date.now();
    let dbReachable = false;
    let latencyMs = null;
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            // Ping the database
            await mongoose_1.default.connection.db.command({ ping: 1 });
            dbReachable = true;
            latencyMs = Date.now() - startTime;
        }
    }
    catch (error) {
        console.error('Database ping failed:', error);
    }
    res.json({
        ok: true,
        service: 'api',
        now: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV || 'development',
            hasDbUrl: !!process.env.MONGODB_URI,
            commitSha: process.env.COMMIT_SHA || null
        },
        db: {
            vendor: 'mongo',
            reachable: dbReachable,
            latencyMs
        },
        version: package_json_1.default.version
    });
});
// POST /health/ping - Echo endpoint
router.post('/health/ping', (req, res) => {
    // Validate request body using zod
    const pingSchema = zod_1.z.object({
        message: zod_1.z.string()
    });
    const result = pingSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            ok: false,
            error: 'Invalid request body. Expected { message: string }'
        });
    }
    res.json({
        ok: true,
        echo: result.data.message,
        now: new Date().toISOString()
    });
});
exports.default = router;
