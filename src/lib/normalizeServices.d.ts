export type NormalizedService = Record<string, unknown>;

declare function normalizeServices(input: unknown): NormalizedService[];
export default normalizeServices;
