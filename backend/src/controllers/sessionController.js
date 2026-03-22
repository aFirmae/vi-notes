const Session = require("../models/Session");
const Report = require("../models/Report");

// POST /api/sessions
const createSession = async (req, res) => {
	try {
		const { title, content } = req.body;

		const session = await Session.create({
			userId: req.userId,
			title: title || "",
			content: content || "",
		});

		res.status(201).json(session);
	} catch (error) {
		console.error("Create session error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// GET /api/sessions
const getSessions = async (req, res) => {
	try {
		const sessions = await Session.find({ userId: req.userId })
			.sort({ updatedAt: -1 })
			.select("-keystrokeData -pasteEvents");

		res.json(sessions);
	} catch (error) {
		console.error("Get sessions error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// GET /api/sessions/:id
const getSession = async (req, res) => {
	try {
		const session = await Session.findOne({
			_id: req.params.id,
			userId: req.userId,
		});

		if (!session) {
			return res.status(404).json({ message: "Session not found" });
		}

		res.json(session);
	} catch (error) {
		console.error("Get session error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// PUT /api/sessions/:id
const updateSession = async (req, res) => {
	try {
		const { title, content } = req.body;

		const session = await Session.findOneAndUpdate(
			{ _id: req.params.id, userId: req.userId },
			{ ...(title !== undefined && { title }), ...(content !== undefined && { content }) },
			{ new: true }
		);

		if (!session) {
			return res.status(404).json({ message: "Session not found" });
		}

		res.json(session);
	} catch (error) {
		console.error("Update session error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

// DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
	try {
		const session = await Session.findOneAndDelete({
			_id: req.params.id,
			userId: req.userId,
		});

		if (!session) {
			return res.status(404).json({ message: "Session not found" });
		}

		const report = await Report.findOne({ sessionId: req.params.id });
		if (report) {
			if (report.reportData && report.reportData.keystrokeCount === 0) {
				await Report.deleteOne({ _id: report._id });
			} else {
				report.isDeleted = true;
				await report.save();
			}
		}

		res.json({ message: "Session deleted" });
	} catch (error) {
		console.error("Delete session error:", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

module.exports = {
	createSession,
	getSessions,
	getSession,
	updateSession,
	deleteSession,
};
