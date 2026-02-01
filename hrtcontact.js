import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const dbName = "HRT-Contact";
const url = "mongodb+srv://HRT-Contact:12345@cluster0.ja1gmnk.mongodb.net/?appName=Cluster0";
const client = new MongoClient(url);
let collection = null;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection("Contacts");
    console.log("✅ MongoDB CONNECTED!");
  } catch (error) {
    console.log("❌ MongoDB ERROR:", error.message);
  }
}

connectDB();

// GET all items
app.get("/HRT-Contact", async (req, res) => {
  if (!collection) return res.json([]);
  const items = await collection.find({}).toArray();
  res.json(items);
});

// POST new item
app.post("/HRT-Contact", async (req, res) => {
  console.log("POST body:", req.body);  // Debug
  if (!collection) return res.status(503).json({error: "DB not ready"});
  
  try {
    const newContact = req.body;
    const result = await collection.insertOne(newContact);
    console.log("✅ Item added:", result.insertedId);
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("POST error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET single item
// GET single item - SAFE ID CHECK
app.get("/HRT-Contact/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("GET single ID:", id);
    
    if (!id || !collection) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    
    const item = await collection.findOne({ _id: new ObjectId(id) });
    res.json(item || null);
  } catch (error) {
    console.error("GET /:id error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});


app.listen(2300)