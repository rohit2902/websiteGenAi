import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { billing, verifyPayment } from "../controllers/Billing.controller.js";

const billingRoute = express.Router();

billingRoute.post("/", authenticateUser, billing);
billingRoute.post("/verify", authenticateUser, verifyPayment);

export default billingRoute;