const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		title: {
			type: String,
			default: "",
			trim: true,
		},
		content: {
			type: String,
			default: "",
		},
		isDeleted: {
			type: Boolean,
			default: false,
			index: true,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
