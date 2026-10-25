import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createServer } from "node:http";

import authRoutes from "./routes/auth.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import courseRoutes from "./routes/course.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import resultRoutes from "./routes/result.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import feeRoutes from "./routes/fee.routes.js";
import searchRoutes from "./routes/search.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import exportRoutes from "./routes/export.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { initSocket } from "./socket.js";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// NFR-security hardening: throttle auth endpoints against brute-force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/upload", uploadRoutes);

// Serve the built frontend in production (npm run build -> npm start).
const clientDist = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 4000);
const httpServer = createServer(app);
initSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`AISMS API (HTTP + WebSocket) listening on http://localhost:${PORT}`);
});
