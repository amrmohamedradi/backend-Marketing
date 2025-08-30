"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertSpec = upsertSpec;
exports.getSpecBySlug = getSpecBySlug;
const db_1 = require("./db");
const Spec_1 = __importDefault(require("../models/Spec"));
const normalize_1 = require("./normalize");
// Mock storage for when DB is not available
const mockSpecs = {};
async function upsertSpec(slug, data) {
    await (0, db_1.connectDB)();
    // Normalize the data before saving
    const normalizedData = (0, normalize_1.normalizeSpec)(data);
    if ((0, db_1.isConnected)()) {
        // Check if we need to preserve existing support data
        const shouldPreserveSupport = !('support' in data);
        if (shouldPreserveSupport) {
            // Get existing spec to preserve support data
            const existingSpec = await Spec_1.default.findOne({ slug });
            if (existingSpec && existingSpec.data && existingSpec.data.support) {
                normalizedData.support = existingSpec.data.support;
            }
        }
        return await Spec_1.default.findOneAndUpdate({ slug }, {
            $set: {
                slug,
                data: normalizedData,
                updatedAt: new Date()
            }
        }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        });
    }
    else {
        // Use mock storage - preserve support data if not provided
        const shouldPreserveSupport = !('support' in data);
        if (shouldPreserveSupport && mockSpecs[slug]?.data?.support) {
            normalizedData.support = mockSpecs[slug].data.support;
        }
        mockSpecs[slug] = {
            slug,
            data: normalizedData,
            createdAt: mockSpecs[slug]?.createdAt || new Date(),
            updatedAt: new Date(),
            id: slug,
            _id: slug
        };
        console.log(`[DEV] Upserted spec to mock storage with slug: ${slug}${shouldPreserveSupport ? ' (preserved support data)' : ''}`);
        return mockSpecs[slug];
    }
}
async function getSpecBySlug(slug) {
    await (0, db_1.connectDB)();
    if ((0, db_1.isConnected)()) {
        return await Spec_1.default.findOne({ slug });
    }
    else {
        return mockSpecs[slug] || null;
    }
}
