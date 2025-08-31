"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const validation_1 = require("./lib/validation");
const storage_1 = require("./lib/storage");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_ORIGIN = 'https://marketing-mauve-ten.vercel.app';
// Global CORS middleware
app.use((0, cors_1.default)({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Add Vary: Origin header
app.use((req, res, next) => {
    res.header('Vary', 'Origin');
    next();
});
// Parse JSON bodies
app.use(express_1.default.json());
// Handle OPTIONS preflight globally
app.options('*', (req, res) => {
    res.status(204).send();
});
// POST /api/specs/:id - Upsert spec
app.post('/api/specs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Validate payload
        const validation = (0, validation_1.validateSpecPayload)(req.body);
        if (!validation.isValid) {
            const response = {
                ok: false,
                error: 'VALIDATION_ERROR',
                details: validation.errors.map(e => `${e.field}: ${e.message}`)
            };
            return res.status(400).json(response);
        }
        // Upsert spec
        const { isNew, spec } = await storage_1.specStore.upsert(id, validation.normalizedData);
        const response = {
            ok: true,
            id,
            spec: spec.data
        };
        console.log(`${isNew ? 'Created' : 'Updated'} spec ${id}`);
        res.status(isNew ? 201 : 200).json(response);
    }
    catch (error) {
        console.error('Error upserting spec:', error);
        const response = {
            ok: false,
            error: 'INTERNAL_ERROR'
        };
        res.status(500).json(response);
    }
});
// GET /api/specs/:id - Fetch spec by id
app.get('/api/specs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const spec = await storage_1.specStore.findById(id);
        if (!spec) {
            const response = {
                ok: false,
                error: 'SPEC_NOT_FOUND'
            };
            return res.status(404).json(response);
        }
        const response = {
            ok: true,
            id,
            spec: spec.data
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching spec:', error);
        const response = {
            ok: false,
            error: 'INTERNAL_ERROR'
        };
        res.status(500).json(response);
    }
});
// DELETE /api/specs/:id - Delete spec
app.delete('/api/specs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await storage_1.specStore.delete(id);
        if (!deleted) {
            const response = {
                ok: false,
                error: 'SPEC_NOT_FOUND'
            };
            return res.status(404).json(response);
        }
        const response = {
            ok: true
        };
        console.log(`Deleted spec ${id}`);
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting spec:', error);
        const response = {
            ok: false,
            error: 'INTERNAL_ERROR'
        };
        res.status(500).json(response);
    }
});
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});
// 404 handler with CORS headers
app.use((req, res) => {
    const response = {
        ok: false,
        error: 'ROUTE_NOT_FOUND'
    };
    res.status(404).json(response);
});
// Global error handler with CORS headers
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    const response = {
        ok: false,
        error: 'INTERNAL_ERROR'
    };
    res.status(500).json(response);
});
// Listen on 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
    console.log(`📡 CORS enabled for: ${FRONTEND_ORIGIN}`);
    console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
});
exports.default = app;
