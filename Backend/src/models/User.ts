import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["donor", "ngo", "volunteer", "admin"],
      required: true,
    },
    organization_name: String,
    contact_number: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    completedOrders: { type: Number, default: 0 },
    joinedDate: { type: Date, default: Date.now },
    isApproved: { type: Boolean, default: false },
    ngoId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for reset token queries
userSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });

export default model("User", userSchema);
