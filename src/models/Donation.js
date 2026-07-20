import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paystackRef: {
      type: String,
      default: null,
      trim: true,
    },
    currency: {
      type: String,
      enum: ["NGN", "USD"],
      default: "NGN",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["one-time"],
      default: "one-time",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
