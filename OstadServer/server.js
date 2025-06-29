const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const { MongoClient } = require("mongodb");

const PORT = 5050;
const MONGO_URL = "mongodb://ostad:ostad@mongo:27017";
const client = new MongoClient(MONGO_URL);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Important for JSON body parsing
app.use(express.static("public")); // To serve frontend if needed

// Connect once
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected successfully to MongoDB server");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

// GET all students
app.get("/getStudents", async (req, res) => {
  try {
    const db = client.db("Ostad-DB");
    const students = await db.collection("students").find({}).toArray();
    res.send(students);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch students" });
  }
});
app.get("/", async (req, res) => {
res.send({
  'message': 'Hello from Ostad Server',
  'author': 'Md Arif Ahammed Reza [TA-Ostad]',
  });
});
// POST new student
app.post("/addStudent", async (req, res) => {
  try {
    const studentData = req.body;
    console.log("Received student data:", studentData);

    const db = client.db("Ostad-DB");
    const result = await db.collection("students").insertOne(studentData);
    console.log("🎯 Student inserted:", result.insertedId);

    res.status(201).send({ message: "Student added successfully", id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to add student" });
  }
});

// Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
