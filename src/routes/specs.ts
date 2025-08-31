import { Router } from "express";
import { normalizeServices } from "../lib/normalizeServices.js"; // adjust if default export

const r = Router();
// TEMP store (replace with DB later)
const DB = new Map<string, any>();
let seq = 1;

// Create with auto id
r.post("/", (req, res) => {
  console.log(`[API] POST /api/specs - Received payload:`, JSON.stringify(req.body, null, 2));
  
  const id = String(seq++);
  // Store the complete payload, not just services
  const row = { id, ...req.body }; // Store the entire request body
  DB.set(id, row);
  
  console.log(`[API] POST /api/specs - Created with ID ${id}:`, JSON.stringify(row, null, 2));
  res.status(201).json({ id, link: `/api/specs/${id}`, ...req.body });
});

// ✅ UPSERT: create if missing, update if exists
r.put("/:id", (req, res) => {
  const id = String(req.params.id);
  console.log(`[API] PUT /api/specs/${id} - Received payload:`, JSON.stringify(req.body, null, 2));
  
  // Store the complete payload, not just services
  const existed = DB.has(id);
  const row = { id, ...req.body }; // Store the entire request body
  DB.set(id, row);
  
  console.log(`[API] PUT /api/specs/${id} - Stored data:`, JSON.stringify(row, null, 2));
  res.status(existed ? 200 : 201).json({ id, link: `/api/specs/${id}`, ...req.body });
});

// (compat) allow POST /:id if FE still uses it
r.post("/:id", (req, res) => {
  const id = String(req.params.id);
  if (DB.has(id)) return res.status(409).json({ message: "ID already exists" });
  console.log(`[API] POST /api/specs/${id} - Received payload:`, JSON.stringify(req.body, null, 2));
  
  // Store the complete payload, not just services
  const row = { id, ...req.body }; // Store the entire request body
  DB.set(id, row);
  
  console.log(`[API] POST /api/specs/${id} - Stored data:`, JSON.stringify(row, null, 2));
  res.status(201).json({ id, link: `/api/specs/${id}`, ...req.body });
});

r.get("/:id", (req, res) => {
  const id = String(req.params.id);
  console.log(`[API] GET /api/specs/${id} - Retrieving data`);
  
  const row = DB.get(id);
  if (!row) {
    console.log(`[API] GET /api/specs/${id} - Not found`);
    return res.status(404).json({ message: "Not Found" });
  }
  
  console.log(`[API] GET /api/specs/${id} - Found data:`, JSON.stringify(row, null, 2));
  res.json(row);
});

r.get("/", (_req, res) => {
  res.json({ data: Array.from(DB.values()) });
});

export default r;