"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSpecPayload = validateSpecPayload;
function validateSpecPayload(body) {
    const errors = [];
    // Check required fields
    if (!body.title || typeof body.title !== 'string') {
        errors.push({ field: 'title', message: 'Title is required and must be a string' });
    }
    if (!body.name) {
        errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!Array.isArray(body.items)) {
        errors.push({ field: 'items', message: 'Items must be an array' });
    }
    else {
        body.items.forEach((item, index) => {
            if (!item.label || typeof item.label !== 'string') {
                errors.push({ field: `items[${index}].label`, message: 'Item label is required and must be a string' });
            }
            if (item.price !== undefined && typeof item.price !== 'number') {
                errors.push({ field: `items[${index}].price`, message: 'Item price must be a number' });
            }
        });
    }
    if (errors.length > 0) {
        return { isValid: false, errors };
    }
    // Normalize data
    const normalizedData = {
        title: body.title,
        name: normalizeNameField(body.name),
        items: body.items,
        meta: body.meta || {}
    };
    return { isValid: true, errors: [], normalizedData };
}
function normalizeNameField(name) {
    if (typeof name === 'string') {
        return { ar: name, en: name };
    }
    if (typeof name === 'object' && name !== null) {
        return {
            ar: name.ar || '',
            en: name.en || ''
        };
    }
    return { ar: '', en: '' };
}
