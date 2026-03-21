const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		userEmail: {
			type: String,
			required: true,
		},
		userFullName: {
			type: String,
			default: "Writer"
		},
		sessionId: {
			type: String,
			required: true,
		},
		sessionTitle: {
			type: String,
			default: "Untitled",
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		reportData: {
			wordCount: { type: Number, default: 0 },
			characterCount: { type: Number, default: 0 },
			keystrokeCount: { type: Number, default: 0 },
			totalInterval: { type: Number, default: 0 },
			pauseCount: { type: Number, default: 0 },
			pasteCount: { type: Number, default: 0 },
			totalPastedCharacters: { type: Number, default: 0 },
			deleteCount: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
);

reportSchema.index({ sessionId: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);
