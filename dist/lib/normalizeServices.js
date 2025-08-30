"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeServices = normalizeServices;
/**
 * Normalize service data to ensure bilingual format
 * Converts legacy string titles to { ar: string } format
 */
function normalizeServices(services) {
    if (!Array.isArray(services))
        return [];
    return services.map(service => {
        const normalizedService = { ...service };
        // Normalize service title
        if (typeof service.title === 'string') {
            normalizedService.title = { ar: service.title };
        }
        // Normalize service name (for dashboard compatibility)
        if (typeof service.name === 'string') {
            normalizedService.name = { ar: service.name };
        }
        // Normalize service items
        if (Array.isArray(service.items)) {
            normalizedService.items = service.items.map((item) => {
                if (typeof item === 'string') {
                    return { text: { ar: item } };
                }
                if (item && typeof item.text === 'string') {
                    return { ...item, text: { ar: item.text } };
                }
                return item;
            });
        }
        // Normalize subServices (for dashboard compatibility)
        if (Array.isArray(service.subServices)) {
            normalizedService.subServices = service.subServices.map((subService) => {
                const normalized = { ...subService };
                if (typeof subService.name === 'string') {
                    normalized.name = { ar: subService.name };
                }
                if (typeof subService.description === 'string') {
                    normalized.description = { ar: subService.description };
                }
                return normalized;
            });
        }
        return normalizedService;
    });
}
