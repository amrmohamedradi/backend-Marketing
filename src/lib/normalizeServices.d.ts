declare module '../lib/normalizeServices.js' {
  export type NormalizedService = Record<string, unknown>;
  const normalizeServices: (input: unknown) => NormalizedService[];
  export default normalizeServices;
}
