const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://tawfikayade_db_user:GRM7AWPy0NdeNIvT@todolistsimple.wldobkm.mongodb.net/?retryWrites=true&w=majority&appName=todolistsimple";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("todolistDB"); // nom de ta base
      console.log("MongoDB connecté ✅");
    } catch (err) {
      console.error("Erreur MongoDB ❌", err);
      process.exit(1);
    }
  }
  return db;
}

// ✅ Exporter correctement la fonction
module.exports = { connectDB };
