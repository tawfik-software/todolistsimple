const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://tawfikayade_db_user:GRM7AWPy0NdeNIvT@todolistsimple.wldobkm.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db;

async function connectDB() {
  await client.connect();
  db = client.db('todolistsimple');
  console.log("MongoDB connecté ✅");
}
connectDB();

// CRUD routes
app.get('/tasks', async (req, res) => {
  const tasks = await db.collection('tasks').find().toArray();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const newTask = req.body;
  const result = await db.collection('tasks').insertOne(newTask);
  res.json({ ...newTask, _id: result.insertedId });
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('tasks').updateOne({ _id: new ObjectId(id) }, { $set: req.body });
  res.json({ success: true });
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
  res.json({ success: true });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});

