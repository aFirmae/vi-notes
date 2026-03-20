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
		keystrokeData: {
			type: [mongoose.Schema.Types.Mixed],
			default: [],
		},
		pasteEvents: {
			type: [mongoose.Schema.Types.Mixed],
			default: [],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
