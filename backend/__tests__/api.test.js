const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/server");

// Test variables to hold state between tests
let token = "";
let userId = "";
let sessionId = "";
let reportId = "";

const testEmail = `testuser_${Date.now()}@example.com`;

describe("Vi-Notes API Integration Tests", () => {

    // Close connection after all tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("Authentication API", () => {
        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    fullName: "Rigorous Test User",
                    email: testEmail,
                    password: "securePassword123"
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("email", testEmail);
            token = res.body.token;
            userId = res.body.user._id;
        });

        it("should not allow duplicate email registration", async () => {
             const res = await request(app)
                .post("/api/auth/register")
                .send({
                    fullName: "Duplicate User",
                    email: testEmail,
                    password: "securePassword123"
                });
            expect(res.statusCode).toEqual(409);
            expect(res.body.message).toContain("already exists");
        });

        it("should login registered user and return persistent token", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testEmail,
                    password: "securePassword123"
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("token");
        });
    });

    describe("Sessions API", () => {
        it("should securely prevent unauthorized session access", async () => {
            const res = await request(app)
                .get("/api/sessions");
            expect(res.statusCode).toEqual(401);
        });

        it("should create a new session", async () => {
            const res = await request(app)
                .post("/api/sessions")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Automated Test Session",
                    content: "This is rigorously tested content."
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("content", "This is rigorously tested content.");
            sessionId = res.body._id;
        });

        it("should fetch user's sessions", async () => {
            const res = await request(app)
                .get("/api/sessions")
                .set("Authorization", `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThanOrEqual(1);
        });

        it("should update existing session content", async () => {
            const res = await request(app)
                .put(`/api/sessions/${sessionId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    content: "This content was securely updated via the API."
                });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("content", "This content was securely updated via the API.");
        });
    });

    describe("Reports API (Typing Delta Simulation)", () => {
        it("should upsert delta report accurately via typing events", async () => {
            const deltaPayload = {
				userId,
				userEmail: testEmail,
				userFullName: "Rigorous Test User",
				sessionTitle: "Automated Test Session",
				wordCount: 8,
				characterCount: 46,
				deltaKeystrokes: 46,
				deltaInterval: 1250,
				deltaPauses: 1,
				deltaPastes: 0,
				deltaPastedChars: 0,
				deltaDeletes: 0
			};

            const res = await request(app)
                .put(`/api/reports/session/${sessionId}/delta`)
                .set("Authorization", `Bearer ${token}`)
                .send(deltaPayload);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.reportData).toHaveProperty("keystrokeCount", 46);
        });

        it("should properly aggregate behavior data when requesting User Report", async () => {
            const res = await request(app)
                .get(`/api/users/${userId}/report`)
                .set("Authorization", `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("aggregate");
            expect(res.body.aggregate).toHaveProperty("totalWordCount");
            expect(res.body.aggregate.totalKeystrokes).toBeGreaterThanOrEqual(46);
            expect(res.body).toHaveProperty("reports");
            expect(Array.isArray(res.body.reports)).toBeTruthy();
        });
    });

    describe("Users API (Server-Side Search)", () => {
        it("should list all writers securely", async () => {
            const res = await request(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });

        it("should successfully filter writers via ?s= regex search parameter matches", async () => {
            const res = await request(app)
                .get("/api/users?s=Rigorous")
                .set("Authorization", `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0]).toHaveProperty("fullName");
            expect(res.body[0].fullName).toContain("Rigorous");
        });

        it("should return empty array when search regex filters heavily without match", async () => {
            const res = await request(app)
                .get("/api/users?s=ImpossiblyRandomStringNoBodyHas")
                .set("Authorization", `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toEqual(0);
        });
    });

});
