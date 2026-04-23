import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import tasksRouter from "./routes/tasks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = isProduction ? Number(process.env.PORT || 3000) : 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/tasks", tasksRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error." });
});

app.listen(port, () => {
  console.log(`StudyBuddy server listening on port ${port}`);
});