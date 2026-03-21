const express = require("express");
const { getReports, getReport, createReport } = require("../controllers/reportController");

const router = express.Router();

// Public routes — no auth required
router.get("/", getReports);
router.get("/:id", getReport);
router.post("/", createReport);

module.exports = router;
