const User = require("../models/User");
const Report = require("../models/Report");

// GET /api/users
const getUsersWithReports = async (req, res) => {
	try {
		const s = req.query.s;
		const userIdsWithReports = await Report.distinct("userId");

		const query = { _id: { $in: userIdsWithReports } };
		if (s) {
			query.$or = [
				{ fullName: { $regex: s, $options: "i" } },
				{ email: { $regex: s, $options: "i" } },
			];
		}

		const users = await User.find(query).select(
			"-passwordHash -__v"
		);

		const userCounts = await Report.aggregate([
			{ $match: { userId: { $in: userIdsWithReports } } },
			{ $group: { _id: "$userId", sessionCount: { $sum: 1 } } },
		]);

		const countMap = Object.fromEntries(
			userCounts.map((u) => [u._id.toString(), u.sessionCount])
		);

		const result = users.map((u) => ({
			...u.toJSON(),
			sessionCount: countMap[u._id.toString()] || 0,
		}));

		res.json(result);
	} catch (error) {
		console.error("getUsersWithReports error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// GET /api/users/:userId/report
const getUserReport = async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findById(userId).select("-passwordHash -__v");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const reports = await Report.find({ userId }).sort({ createdAt: -1 });

		if (reports.length === 0) {
			return res.json({ user, reports: [], aggregate: null });
		}

		// Compute aggregate stats
		const totalWordCount = reports.reduce((s, r) => s + (r.reportData?.wordCount || 0), 0);
		const totalCharCount = reports.reduce((s, r) => s + (r.reportData?.characterCount || 0), 0);
		const totalKeystrokes = reports.reduce((s, r) => s + (r.reportData?.keystrokeCount || 0), 0);
		const totalPauses = reports.reduce((s, r) => s + (r.reportData?.pauseCount || 0), 0);
		const totalPastes = reports.reduce((s, r) => s + (r.reportData?.pasteCount || 0), 0);
		const totalPastedChars = reports.reduce((s, r) => s + (r.reportData?.totalPastedCharacters || 0), 0);
		const totalDeletes = reports.reduce((s, r) => s + (r.reportData?.deleteCount || 0), 0);
		const totalInterval = reports.reduce((s, r) => s + (r.reportData?.totalInterval || 0), 0);

		const avgKeystrokeInterval = totalKeystrokes > 0 ? Math.round(totalInterval / totalKeystrokes) : 0;

		const aggregate = {
			sessionCount: reports.length,
			totalWordCount,
			totalCharCount,
			totalKeystrokes,
			avgKeystrokeInterval,
			totalPauses,
			totalPastes,
			totalPastedChars,
			totalDeletes,
		};

		const formattedReports = reports.map((r) => {
			const json = r.toJSON();
			const ks = json.reportData?.keystrokeCount || 0;
			const ti = json.reportData?.totalInterval || 0;
			json.reportData.averageKeystrokeInterval = ks > 0 ? Math.round(ti / ks) : 0;
			return json;
		});

		res.json({ user, reports: formattedReports, aggregate });
	} catch (error) {
		console.error("getUserReport error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = { getUsersWithReports, getUserReport };
