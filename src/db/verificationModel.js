const mongoose = require("mongoose");

const verificationSchema = mongoose.Schema({
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  active: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Verification = mongoose.model("verification", verificationSchema);

module.exports = {
  Verification,
};
