import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import listRoutes from "./routes/lists.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/lists", listRoutes);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const staticPath = process.env.CLIENT_BUILD_PATH 
    ? process.env.CLIENT_BUILD_PATH
    : path.resolve(__dirname, "..", "..", "..", "client", "dist");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`API available at http://localhost:${port}/api`);
  });
}

startServer().catch(console.error);
