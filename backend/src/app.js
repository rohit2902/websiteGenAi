import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import authRoute from "./routes/auth.route.js";
import websiteRoute from "./routes/website.route.js";
import billingRoute from "./routes/billing.route.js";
import { stripeWebhook } from "./services/stripeWebhook.js";

const app = express();

// Stripe Webhook Endpoint (Raw body parser before express.json)
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://websitegenai.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
        callback(null, true);
      } else {
        callback(null, origin);
      }
    },
    credentials: true,
  })
);
app.use(express.static("./public"));

app.use("/api/auth", authRoute);
app.use("/api/website", websiteRoute);
app.use("/api/billing", billingRoute);

// Wildcard fallback route to serve SPA index.html for client routes (e.g., /generate, /dashboard)
app.get("*", (req, res) => {
  res.sendFile(path.resolve("./public/index.html"), (err) => {
    if (err) {
      res.status(404).json({ success: false, message: "Route not found" });
    }
  });
});

export default app;