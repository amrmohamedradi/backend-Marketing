"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specSchema = void 0;
const zod_1 = require("zod");
// Define the validation schema for the spec data
exports.specSchema = zod_1.z.object({
    clientName: zod_1.z.string().min(1, 'Client name is required'),
    brief: zod_1.z.string().min(1, 'Brief is required'),
    services: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.string(),
        items: zod_1.z.array(zod_1.z.string())
    })),
    pricing: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        price: zod_1.z.number(),
        currency: zod_1.z.string(),
        features: zod_1.z.array(zod_1.z.string())
    })),
    contact: zod_1.z.object({
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().optional(),
        website: zod_1.z.string().url().optional()
    }),
    meta: zod_1.z.object({
        brandColors: zod_1.z.array(zod_1.z.string()).optional(),
        logoUrl: zod_1.z.string().url().optional()
    })
});
