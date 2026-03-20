const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		passwordHash: {
			type: String,
			required: [true, "Password is required"],
		},
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("passwordHash")) return next();
	const salt = await bcrypt.genSalt(10);
	this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
	next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove passwordHash from JSON output
userSchema.set("toJSON", {
	transform: (_doc, ret) => {
		delete ret.passwordHash;
		delete ret.__v;
		return ret;
	},
});

module.exports = mongoose.model("User", userSchema);
