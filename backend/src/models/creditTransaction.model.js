import mongoose from "mongoose";

const creditTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deduct", "add"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const creditTransactionModel = mongoose.model(
  "CreditTransaction",
  creditTransactionSchema
);

export default creditTransactionModel;
