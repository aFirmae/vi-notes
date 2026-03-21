const express = require("express");
const { getReport, upsertReportDelta } = require("../controllers/reportController");

const router = express.Router();

// Public routes
router.get("/:id", getReport);
router.put("/session/:sessionId/delta", upsertReportDelta);

module.exports = router;
