const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@assignment12.130rwa2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const membershipCollection = client
      .db("devPointDB")
      .collection("membership");
    const postCollection = client.db("devPointDB").collection("posts");
    const announcementCollection = client
      .db("devPointDB")
      .collection("announcements");

    // post api--------------
    app.get("/all-post", async (req, res) => {
      try {
        const result = await postCollection
          .find()
          .sort({ postedTime: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    });

    // announcement api -------------
    app.get("/announcements", async (req, res) => {
      const result = await announcementCollection.find().toArray();
      res.send(result);
    });

    // membership data ---------------------------------
    app.get("/membership", async (req, res) => {
      const result = await membershipCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Dev Point Server Running!");
});

app.listen(port, () => {
  console.log(`Dev Point Running on port ${port}`);
});
