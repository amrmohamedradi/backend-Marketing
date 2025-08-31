import { Router } from "express";
import { normalizeServices } from "../lib/normalizeServices";

const r = Router();

// In-memory store (replace with DB)
const DB = new Map<string, any>();
let seq = 1;

// POST /api/specs               -> auto id (create)
r.post("/", (req, res) => {
  const body = req.body ?? {};
  const services = normalizeServices(body.services ?? []);
  const id = String(seq++);
  const row = { id, services };
  DB.set(id, row);
  res.status(201).json({ id, link: `/api/specs/${id}`, services });
});

// ✅ PUT /api/specs/:id          -> UPSERT (create or update)
r.put("/:id", (req, res) => {
  const id = String(req.params.id);
  const body = req.body ?? {};
  const services = normalizeServices(body.services ?? []);
  const row = { id, services };
  const exists = DB.has(id);
  DB.set(id, row);
  return res.status(exists ? 200 : 201).json({ id, link: `/api/specs/${id}`, services });
});

// GET /api/specs/:id            -> fetch one
r.get("/:id", (req, res) => {
  const id = String(req.params.id);
  const row = DB.get(id);
  if (!row) return res.status(404).json({ message: "Not Found" });
  res.json(row);
});

// GET /api/specs                -> list
r.get("/", (_req, res) => {
  res.json({ data: Array.from(DB.values()) });
});

// (Optional compatibility) allow POST /:id for old clients
r.post("/:id", (req, res) => {
  const id = String(req.params.id);
  if (DB.has(id)) return res.status(409).json({ message: "ID already exists" });
  const services = normalizeServices((req.body ?? {}).services ?? []);
  const row = { id, services };
  DB.set(id, row);
  res.status(201).json({ id, link: `/api/specs/${id}`, services });
});

export default r;
