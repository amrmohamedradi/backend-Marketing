"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toI18n = toI18n;
exports.normalizeSpec = normalizeSpec;
// Helper to convert string/object to i18n format
function toI18n(value) {
    if (value == null)
        return {};
    if (typeof value === 'string')
        return { ar: value };
    if (typeof value === 'object' && value !== null) {
        // Return as-is if it's already an object, but ensure string values
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            if (typeof val === 'string') {
                result[key] = val;
            }
        }
        return result;
    }
    return {};
}
// Normalize spec data to handle legacy and bilingual formats
function normalizeSpec(data) {
    if (!data || typeof data !== 'object') {
        return {};
    }
    // Handle legacy format conversion
    const normalized = { ...data };
    // Ensure bilingual support for client info
    if (normalized.client && typeof normalized.client === 'object') {
        const client = normalized.client;
        normalized.client = {
            ...client,
            name: toI18n(client.name || client.name_ar),
            company: toI18n(client.company || client.company_ar),
            email: client.email,
            phone: client.phone
        };
    }
    else if (normalized.clientName) {
        normalized.client = {
            name: toI18n(normalized.clientName),
            company: toI18n(normalized.companyName || ''),
            email: normalized.clientEmail || '',
            phone: normalized.clientPhone || ''
        };
    }
    // Normalize services array
    if (Array.isArray(normalized.services)) {
        normalized.services = normalized.services.map((service) => ({
            ...service,
            title: toI18n(service.title || service.name),
            name: service.name || service.title,
            items: Array.isArray(service.items) ? service.items.map((item) => {
                const text = (item && typeof item === 'object' && 'text' in item) ? item.text : item;
                return { text: toI18n(text) };
            }) : (Array.isArray(service.subServices) ? service.subServices.map((sub) => ({
                text: toI18n(sub.name || sub.text)
            })) : [])
        }));
    }
    // Ensure support array exists
    if (!Array.isArray(normalized.support)) {
        normalized.support = [];
    }
    return normalized;
}
