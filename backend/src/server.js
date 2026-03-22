require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ health: "ok" });
});

app.get("/", (_req, res) => {
    res.redirect("/api/health");
});

// Local server
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" && !process.env.NETLIFY) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Serverless handler exports for Netlify / AWS Lambda
module.exports = app;
module.exports.handler = serverless(app);
