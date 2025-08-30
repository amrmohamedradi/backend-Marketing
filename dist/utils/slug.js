"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = void 0;
const nanoid_1 = require("nanoid");
const slugify_1 = __importDefault(require("slugify"));
/**
 * Generates a unique slug for a spec
 * @param title Optional title to include in the slug
 * @returns A unique slug string
 */
const generateSlug = (title) => {
    const uniqueId = (0, nanoid_1.nanoid)(7); // Generate a 7-character unique ID
    if (!title) {
        return uniqueId;
    }
    // Create a slug from the title and append the unique ID
    const titleSlug = (0, slugify_1.default)(title, {
        lower: true, // Convert to lowercase
        strict: true, // Strip special characters
        trim: true // Trim leading/trailing spaces
    });
    // Combine the title slug with the unique ID
    return `${titleSlug}-${uniqueId}`;
};
exports.generateSlug = generateSlug;
