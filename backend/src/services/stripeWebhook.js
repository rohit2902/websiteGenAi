import Stripe from "stripe";
import userModel from "../models/user.model.js";
import creditTransactionModel from "../models/creditTransaction.model.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
const StripeApi = new Stripe(stripeSecretKey || "");

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("Webhook Error: Missing stripe-signature header");
    return res.status(400).json({
      success: false,
      message: "Missing stripe-signature header",
    });
  }

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret === "whsec_test_secret_or_stripe_cli") {
      // In development without CLI secret match, parse JSON fallback
      console.warn("Webhook Secret Warning: Using unverified event parsing for development");
      event = JSON.parse(req.body.toString());
    } else {
      event = StripeApi.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
  } catch (error) {
    console.error("Webhook Signature Verification Error:", error.message);
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`,
    });
  }

  console.log("Stripe Webhook Event Received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("Processing checkout.session.completed:", session.id);

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || "pro";
    const credits = Number(session.metadata?.credits || "500");

    if (!userId) {
      console.error("Webhook Error: Missing userId in session metadata");
      return res.status(400).json({
        success: false,
        message: "Missing userId in session metadata",
      });
    }

    try {
      // Idempotency check using creditTransactionModel
      const sessionReason = `Stripe Session: ${session.id}`;
      const existingTransaction = await creditTransactionModel.findOne({
        reason: sessionReason,
      });

      if (existingTransaction) {
        console.log(`Session ${session.id} already processed. Skipping duplicate update.`);
        return res.status(200).json({
          received: true,
          message: "Event already processed",
        });
      }

      const user = await userModel.findById(userId);
      if (!user) {
        console.error(`Webhook Error: User ${userId} not found in database`);
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update user plan & credits
      user.credit = (user.credit || 0) + credits;
      user.plan = plan;
      await user.save();

      // Record transaction history log
      await creditTransactionModel.create({
        userId: user._id,
        type: "add",
        amount: credits,
        reason: sessionReason,
      });

      console.log(
        `✅ Webhook Success: Added ${credits} credits to User ${user._id} (${user.email}). New Credit: ${user.credit}, Plan: ${user.plan}`
      );
    } catch (dbError) {
      console.error("Database Update Error in Webhook:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to update user record in database",
      });
    }
  }

  return res.status(200).json({
    received: true,
  });
};
