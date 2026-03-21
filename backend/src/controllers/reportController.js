const Report = require("../models/Report");

// GET /api/reports — all reports
const getReports = async (req, res) => {
	try {
		const reports = await Report.find().sort({ createdAt: -1 });
		res.json(reports);
	} catch (error) {
		console.error("getReports error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// GET /api/reports/:id — single report
const getReport = async (req, res) => {
	try {
		const report = await Report.findById(req.params.id);
		if (!report) {
			return res.status(404).json({ message: "Report not found" });
		}
		res.json(report);
	} catch (error) {
		console.error("getReport error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// POST /api/reports — create report
const createReport = async (req, res) => {
	try {
		const { userId, userEmail, sessionId, sessionTitle, reportData } = req.body;

		if (!userId || !userEmail || !sessionId) {
			return res.status(400).json({ message: "userId, userEmail, and sessionId are required" });
		}

		const report = await Report.create({
			userId,
			userEmail,
			sessionId,
			sessionTitle: sessionTitle || "Untitled",
			reportData: reportData || {},
		});

		res.status(201).json(report);
	} catch (error) {
		console.error("createReport error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = { getReports, getReport, createReport };
