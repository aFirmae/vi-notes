const express = require("express");
const { getUsersWithReports, getUserReport } = require("../controllers/userController");

const router = express.Router();

// Public routes
router.get("/", getUsersWithReports);
router.get("/:userId/report", getUserReport);

module.exports = router;
