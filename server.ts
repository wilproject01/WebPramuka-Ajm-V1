import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Registration Submission Proxy for Google Sheets
  app.post("/api/submit-registration", async (req, res) => {
    const data = req.body;
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      console.warn("GOOGLE_SHEET_WEBHOOK_URL is not a valid URL or not configured. Skipping spreadsheet sync. Value:", webhookUrl);
      return res.json({ success: true, message: "Firestore saved, but Sheet sync skipped due to invalid URL." });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Sheet Webhook failed: ${response.statusText}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error syncing to Google Sheet:", error);
      res.status(500).json({ success: false, error: "Failed to sync to Google Sheet" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
