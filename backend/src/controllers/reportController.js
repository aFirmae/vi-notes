const Report = require("../models/Report");

// GET /api/reports/:id
const getReport = async (req, res) => {
	try {
		const report = await Report.findById(req.params.id);
		if (!report) {
			return res.status(404).json({ message: "Report not found" });
		}

		const json = report.toJSON();
		const ks = json.reportData?.keystrokeCount || 0;
		const ti = json.reportData?.totalInterval || 0;
		json.reportData.averageKeystrokeInterval = ks > 0 ? Math.round(ti / ks) : 0;

		res.json(json);
	} catch (error) {
		console.error("getReport error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// PUT /api/reports/session/:sessionId/delta
const upsertReportDelta = async (req, res) => {
	try {
		const { sessionId } = req.params;
		const body = req.body;

		if (!body.userId || !body.userEmail) {
			return res.status(400).json({ message: "userId and userEmail are required" });
		}

		const report = await Report.findOneAndUpdate(
			{ sessionId },
			{
				$set: {
					userId: body.userId,
					userEmail: body.userEmail,
					userFullName: body.userFullName || "Writer",
					sessionId,

					"reportData.wordCount": body.wordCount || 0,
					"reportData.characterCount": body.characterCount || 0,
				},
				$inc: {
					"reportData.keystrokeCount": body.deltaKeystrokes || 0,
					"reportData.totalInterval": body.deltaInterval || 0,
					"reportData.pauseCount": body.deltaPauses || 0,
					"reportData.pasteCount": body.deltaPastes || 0,
					"reportData.totalPastedCharacters": body.deltaPastedChars || 0,
					"reportData.deleteCount": body.deltaDeletes || 0,
				}
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		res.json(report);
	} catch (error) {
		console.error("upsertReportDelta error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = { getReport, upsertReportDelta };
