import { Router } from "express";
import { normalizeServices } from "../lib/normalizeServices.js"; // adjust if default export

const r = Router();
// TEMP store (replace with DB later)
const DB = new Map<string, any>();
let seq = 1;

// Create with auto id
r.post("/", (req, res) => {
  const { client = {}, services = [] } = req.body ?? {};
  const id = String(seq++);
  const row = { id, client, services: normalizeServices(services) };
  DB.set(id, row);
  res.status(201).json({ id, client: row.client, services: row.services, link: `/api/specs/${id}` });
});

// ✅ UPSERT: create if missing, update if exists
r.put("/:id", (req, res) => {
  const id = String(req.params.id);
  const { client = {}, services = [] } = req.body ?? {};
  const existed = DB.has(id);
  const row = { id, client, services: normalizeServices(services) };
  DB.set(id, row);
  res.status(existed ? 200 : 201).json({ id, client: row.client, services: row.services, link: `/api/specs/${id}` });
});

// (compat) allow POST /:id if FE still uses it
r.post("/:id", (req, res) => {
  const id = String(req.params.id);
  if (DB.has(id)) return res.status(409).json({ message: "ID already exists" });
  const { client = {}, services = [] } = req.body ?? {};
  const row = { id, client, services: normalizeServices(services) };
  DB.set(id, row);
  res.status(201).json({ id, client: row.client, services: row.services, link: `/api/specs/${id}` });
});

r.get("/:id", (req, res) => {
  const row = DB.get(String(req.params.id));
  if (!row) return res.status(404).json({ message: "Not Found" });
  res.json(row);
});

r.get("/", (_req, res) => {
  res.json({ data: Array.from(DB.values()) });
});

export default r;
