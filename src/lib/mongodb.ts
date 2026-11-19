import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let db: Db;

if (uri && (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"))) {
  client = new MongoClient(uri);
  db = client.db("studiospace");
} else {
  // No valid MONGODB_URI provided. Create a client reference that will
  // fail at runtime when an actual connection is attempted.
  client = new MongoClient("mongodb://localhost:27017/studiospace");
  db = client.db("studiospace");
}

export { db, client };