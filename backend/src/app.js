import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import websiteRoute from "./routes/website.route.js";
import billingRoute from "./routes/billing.route.js";
import { stripeWebhook } from "./services/stripeWebhook.js";

const app = express();

// Stripe Webhook Endpoint (Raw body parser before express.json)
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://websitegenai.onrender.com",
    credentials: true,
  })
);
app.use(express.static("./public"))

app.use("/api/auth", authRoute);
app.use("/api/website", websiteRoute);
app.use("/api/billing", billingRoute);

export default app;