"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const spec_1 = require("../validation/spec");
const slug_1 = require("../utils/slug");
const upsert_1 = require("../lib/upsert");
const normalizeServices_1 = require("../lib/normalizeServices");
const router = express_1.default.Router();
// POST /api/specs/:slug - Create or update a spec (upsert)
router.post('/api/specs/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const specData = req.body;
        // Validate slug parameter
        if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid or missing slug parameter'
            });
        }
        if (!specData || Object.keys(specData).length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Empty or invalid JSON body'
            });
        }
        // Set cache headers for no-store to ensure fresh data
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Content-Type', 'application/json');
        // Check if we should preserve support data
        const preserveSupport = req.headers['x-preserve-support'] === '1';
        // Normalize services data before saving
        if (specData.services) {
            try {
                specData.services = (0, normalizeServices_1.normalizeServices)(specData.services);
            }
            catch (error) {
                return res.status(400).json({
                    ok: false,
                    message: 'Invalid services data format'
                });
            }
        }
        // If preserving support, remove it from incoming data so upsert preserves existing
        if (preserveSupport) {
            delete specData.support;
        }
        // Upsert the spec using helper
        const spec = await (0, upsert_1.upsertSpec)(slug, specData);
        if (!spec) {
            return res.status(500).json({
                ok: false,
                message: 'Failed to save spec to database'
            });
        }
        // Return success with slug and id
        return res.status(200).json({
            ok: true,
            slug,
            id: spec?.id || spec?._id || slug
        });
    }
    catch (error) {
        console.error('Error upserting spec:', error);
        return res.status(500).json({
            ok: false,
            message: error instanceof Error ? error.message : 'Failed to save spec'
        });
    }
});
// POST /api/specs - Create a new spec (legacy endpoint)
router.post('/api/specs', async (req, res) => {
    try {
        // Validate the request body
        const validationResult = spec_1.specSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                ok: false,
                message: 'Validation failed',
                errors: validationResult.error.format()
            });
        }
        const specData = validationResult.data;
        // Normalize services data before saving
        if (specData.services) {
            specData.services = (0, normalizeServices_1.normalizeServices)(specData.services);
        }
        // Generate a slug for the spec
        const slug = (0, slug_1.generateSlug)(specData.clientName);
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        // Use upsert helper for consistency
        await (0, upsert_1.upsertSpec)(slug, specData);
        // Return the slug and URL
        return res.status(201).json({
            ok: true,
            slug,
            url: `${baseUrl}/s/${slug}`
        });
    }
    catch (error) {
        console.error('Error creating spec:', error);
        return res.status(500).json({
            ok: false,
            message: error instanceof Error ? error.message : 'Failed to create spec'
        });
    }
});
// GET /api/specs/:slug - Get a spec by slug
router.get('/api/specs/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        // Validate slug parameter
        if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid or missing slug parameter'
            });
        }
        // Set cache headers for no-store to ensure fresh data
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Content-Type', 'application/json');
        // Get spec using helper
        const spec = await (0, upsert_1.getSpecBySlug)(slug);
        if (!spec) {
            return res.status(404).json({
                ok: false,
                message: 'Spec not found'
            });
        }
        if (!spec.data) {
            return res.status(500).json({
                ok: false,
                message: 'Spec data is corrupted'
            });
        }
        // Return the data field which contains the actual spec data
        return res.json(spec.data);
    }
    catch (error) {
        console.error('Error fetching spec:', error);
        return res.status(500).json({
            ok: false,
            message: 'Failed to fetch spec'
        });
    }
});
// GET /s/:slug - Render the spec page
router.get('/s/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        // Get spec using helper
        const spec = await (0, upsert_1.getSpecBySlug)(slug);
        if (!spec) {
            return res.status(404).render('error', {
                error: 'Spec not found'
            });
        }
        // Render the spec page
        return res.render('spec', { spec: spec });
    }
    catch (error) {
        console.error('Error rendering spec page:', error);
        return res.status(500).render('error', {
            error: 'Failed to render spec page'
        });
    }
});
exports.default = router;
