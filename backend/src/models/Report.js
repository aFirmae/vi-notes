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
		sessionId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Session",
			required: true,
		},
		sessionTitle: {
			type: String,
			default: "Untitled",
		},
		reportData: {
			wordCount: { type: Number, default: 0 },
			characterCount: { type: Number, default: 0 },
			keystrokeCount: { type: Number, default: 0 },
			averageKeystrokeInterval: { type: Number, default: 0 },
			pauseCount: { type: Number, default: 0 },
			pasteCount: { type: Number, default: 0 },
			totalPastedCharacters: { type: Number, default: 0 },
			deleteCount: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
