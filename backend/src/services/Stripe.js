import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;

if (!stripeSecretKey) {
  console.warn("WARNING: Stripe secret key is missing in environment variables.");
}

const stripe = new Stripe(stripeSecretKey || "");

export default stripe;