import { Router, Request, Response } from "express";
import { z } from "zod";
import { normalizeServices } from "../lib/normalizeServices";

const r = Router();

const BiText = z.union([z.string(), z.object({ ar: z.string().optional(), en: z.string().optional() })]);
const ItemZ = z.object({ text: BiText.or(z.string()) });
const SubZ = z.object({
  name: BiText.or(z.string()),
  description: BiText.or(z.string()).optional()
});
const ServiceZ = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  title: BiText.or(z.string()),
  name: BiText.or(z.string()).optional(),
  items: z.array(z.union([ItemZ, z.string()])).default([]),
  subServices: z.array(SubZ).default([])
});
const BodyZ = z.object({ services: z.array(ServiceZ).default([]) });

// In-memory store (replace with DB if you have one)
interface SpecData {
  id: string;
  services: any[];
  [key: string]: any;
}

const DB: Record<string, SpecData> = {};
let seq = 1;

r.get("/", (_req: Request, res: Response) => {
  res.json({ data: Object.values(DB) });
});

r.get("/:id", (req: Request, res: Response) => {
  const row = DB[req.params.id];
  if (!row) return res.status(404).json({ message: "Not Found" });
  res.json(row);
});

r.post("/", (req: Request, res: Response) => {
  const parsed = BodyZ.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", details: parsed.error.issues });

  // normalize services to bilingual shape
  const services = normalizeServices(parsed.data.services);
  const id = String(seq++);
  DB[id] = { id, services };
  const link = `/api/specs/${id}`;
  res.status(201).json({ id, link, services });
});

r.put("/:id", (req: Request, res: Response) => {
  const parsed = BodyZ.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", details: parsed.error.issues });

  if (!DB[req.params.id]) return res.status(404).json({ message: "Not Found" });
  const services = normalizeServices(parsed.data.services);
  DB[req.params.id] = { id: req.params.id, services };
  res.json(DB[req.params.id]);
});

r.delete("/:id", (req: Request, res: Response) => {
  if (!DB[req.params.id]) return res.status(404).json({ message: "Not Found" });
  delete DB[req.params.id];
  res.status(204).send();
});

export default r;