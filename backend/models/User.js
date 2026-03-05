const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobileNumber: {          // ✅ ADD THIS
      type: String,
      required: true,
      trim: true,
    },


   password: {
  type: String,
  minlength: 6,
},

    role: {
      type: String,
      enum: ["patient", "admin", "vendor"],
      default: "patient",
    },

    // 🔥 NEW FIELDS FOR GOOGLE LOGIN
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
    },

    profileImage: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    // 🔥 For future security (failed login rule)
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },

    passwordResetToken: {
  type: String,
},

passwordResetExpires: {
  type: Date,
},
  },
  {
    timestamps: true,
  }
  
  
);


// 🔐 Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔐 Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);