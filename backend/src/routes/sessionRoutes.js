const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
	createSession,
	getSessions,
	getSession,
	updateSession,
	deleteSession,
} = require("../controllers/sessionController");

const router = express.Router();

// All session routes require authentication
router.use(authMiddleware);

router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSession);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

module.exports = router;
