import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: String,
  createdAt: { type: Date, default: Date.now, expires: 3600 } // 1 hour expiry
});

export default mongoose.model("ResetToken", resetTokenSchema);
