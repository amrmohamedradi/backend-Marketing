import express from "express";

const router = express.Router();

const LT_URL = process.env.LT_URL || "https://libretranslate.com/translate";
const cache = new Map<string, string>();

router.post("/translate", async (req, res) => {
  try {
    const { q, source = "auto", target = "ar", format = "text", api_key } = req.body || {};
    
    // normalize shape to string[] for caching
    const toArr = (x: any) => Array.isArray(x) ? x : [x];
    const items = toArr(q);
    
    const key = JSON.stringify({ items, source, target });
    if (cache.has(key)) {
      res.setHeader("Vary", "Accept-Language");
      return res.status(200).type("application/json").send(cache.get(key)!);
    }
    
    const response = await fetch(LT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: items, source, target, format, api_key }),
    });
    
    const text = await response.text();
    
    if (response.ok) {
      cache.set(key, text);
    }
    
    res.setHeader("Vary", "Accept-Language");
    res.status(response.status).type("application/json").send(text);
  } catch (error) {
    console.error("[API] Translation error:", error);
    res.status(500).json({ error: "Translation service unavailable" });
  }
});

export default router;