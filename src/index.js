import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { success } from "./utils/ApiResponse.js";
import authRoutes from "./routes/auth.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import messageRoutes from "./routes/message.routes.js";
import contentRoutes from "./routes/content.routes.js";
import leadershipRoutes from "./routes/leadership.routes.js";
import milestoneRoutes from "./routes/milestone.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import administratorRoutes from "./routes/administrator.routes.js";
import analyticsRoutes from "./routes/analytics.route.js"

const app = express();
const PORT = process.env.PORT || 5000;

const admin_url = process.env.ADMIN_URL.split(",");
const client_url = process.env.CLIENT_URL.split(",");

const allowedOrigins = [...client_url, ...admin_url].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  success(
    res,
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      mongodb: Boolean(process.env.MONGODB_URI),
    },
    "API is healthy",
  );
});

app.use("/auth", authRoutes);
app.use("/analytics", analyticsRoutes)
app.use("/gallery", galleryRoutes);
app.use("/donations", donationRoutes);
app.use("/messages", messageRoutes);
app.use("/content", contentRoutes);
app.use("/leadership", leadershipRoutes);
app.use("/milestones", milestoneRoutes);
app.use("/settings", settingsRoutes);
app.use("/media", mediaRoutes);
app.use("/audit-logs", auditRoutes);
app.use("/audit-log", auditRoutes);
app.use("/administrators", administratorRoutes);
app.use("/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
  });
});

app.use(errorMiddleware);

/**
 * Boot the Express server after attempting a DB connection.
 * @returns {Promise<void>}
 */
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `[server] Divine Gospel Delight Foundation API listening on port ${PORT}`,
    );
  });
}

start().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});

export default app;
