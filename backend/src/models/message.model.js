import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    website: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "website",
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant", "ai"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;