import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    prompt: {
      type: String,
      default: "",
    },

    files: [
      {
        path: { type: String, required: true },
        content: { type: String, default: "" },
      },
    ],

    latestCode: {
      type: String,
      default: "",
    },

    deployed: {
      type: Boolean,
      default: false,
    },

    deployUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },

    slug: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const websiteModel = mongoose.model("website", websiteSchema);

export default websiteModel;