import { PLANS } from "../services/Plan.js";
import stripe from "../services/Stripe.js";
import userModel from "../models/user.model.js";
import creditTransactionModel from "../models/creditTransaction.model.js";

export const billing = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user._id;

    if (!planType) {
      return res.status(400).json({
        success: false,
        message: "Plan type is required",
      });
    }

    const plan = PLANS[planType];
    
    if (!plan || plan.price === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid paid plan selected",
      });
    }

    if (!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Stripe secret key is missing.",
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `GenWeb.ai ${planType.toUpperCase()} Plan`,
              description: `${plan.credits} Monthly Credits`,
            },
            unit_amount: plan.price * 100, // Stripe expects amount in paise
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        plan: plan.plan,
        credits: plan.credits.toString(),
      },
      customer_email: req.user.email,
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-cancel`,
    });

    return res.status(200).json({
      success: true,
      message: "Billing session created successfully",
      checkoutUrl: session.url,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Billing Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create checkout session",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Stripe checkout session not found",
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment has not been completed or verified",
      });
    }

    const userId = session.metadata?.userId || req.user?._id;
    const planName = session.metadata?.plan || "pro";
    const creditsToAdd = parseInt(session.metadata?.credits || "500", 10);

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if transaction was already recorded for this session ID
    const sessionReason = `Stripe Session: ${sessionId}`;
    const existingTransaction = await creditTransactionModel.findOne({
      reason: sessionReason,
    });

    if (existingTransaction) {
      return res.status(200).json({
        success: true,
        message: "Payment already processed and verified",
        user,
      });
    }

    // Add credits & update user plan
    user.credit = (user.credit || 0) + creditsToAdd;
    user.plan = planName;
    await user.save();

    // Store transaction history
    await creditTransactionModel.create({
      userId: user._id,
      type: "add",
      amount: creditsToAdd,
      reason: sessionReason,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully and credits added",
      user,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};