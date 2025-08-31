"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const normalizeServices_1 = require("../lib/normalizeServices");
const r = (0, express_1.Router)();
const BiText = zod_1.z.union([zod_1.z.string(), zod_1.z.object({ ar: zod_1.z.string().optional(), en: zod_1.z.string().optional() })]);
const ItemZ = zod_1.z.object({ text: BiText.or(zod_1.z.string()) });
const SubZ = zod_1.z.object({
    name: BiText.or(zod_1.z.string()),
    description: BiText.or(zod_1.z.string()).optional()
});
const ServiceZ = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    title: BiText.or(zod_1.z.string()),
    name: BiText.or(zod_1.z.string()).optional(),
    items: zod_1.z.array(zod_1.z.union([ItemZ, zod_1.z.string()])).default([]),
    subServices: zod_1.z.array(SubZ).default([])
});
const BodyZ = zod_1.z.object({ services: zod_1.z.array(ServiceZ).default([]) });
const DB = {};
let seq = 1;
r.get("/", (_req, res) => {
    res.json({ data: Object.values(DB) });
});
r.get("/:id", (req, res) => {
    const row = DB[req.params.id];
    if (!row)
        return res.status(404).json({ message: "Not Found" });
    res.json(row);
});
r.post("/", (req, res) => {
    const parsed = BodyZ.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid payload", details: parsed.error.issues });
    // normalize services to bilingual shape
    const services = (0, normalizeServices_1.normalizeServices)(parsed.data.services);
    const id = String(seq++);
    DB[id] = { id, services };
    const link = `/api/specs/${id}`;
    res.status(201).json({ id, link, services });
});
r.put("/:id", (req, res) => {
    const parsed = BodyZ.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid payload", details: parsed.error.issues });
    if (!DB[req.params.id])
        return res.status(404).json({ message: "Not Found" });
    const services = (0, normalizeServices_1.normalizeServices)(parsed.data.services);
    DB[req.params.id] = { id: req.params.id, services };
    res.json(DB[req.params.id]);
});
r.delete("/:id", (req, res) => {
    if (!DB[req.params.id])
        return res.status(404).json({ message: "Not Found" });
    delete DB[req.params.id];
    res.status(204).send();
});
exports.default = r;
