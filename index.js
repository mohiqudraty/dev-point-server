const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
      .collection("announcement");
    const userCollection = client
      .db("devPointDB")
      .collection("users");





// users api ----------------------------------
app.post('/users', async (req, res) => {
  const user = req.body

const query = {email: user.email}
const existUser = await userCollection.findOne(query)
if(existUser){
  return  res.send({message: "User Already Exist Please Login", insertedId: null})
}

  const result = await userCollection.insertOne(user)
  res.send(result)
})

// user get api -----------------------
app.get('/users', async (req, res) => {
  const email = req.query.email
  console.log(email);
  const query = {email: email}
  const result = await userCollection.findOne(query)
  res.send(result)
})
// get all user api -----------
app.get('/all-users', async (req, res) => {
  const result = await userCollection.find().toArray()
  res.send(result)
})


    // voting ================================
    // api  for up voting a post-------------------
    app.put("/posts/:id/upvote", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await postCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { upVote: 1 } }
        );
        res.send(result);
      } catch (error) {
        console.error("Error up voting post:", error);
        res
          .status(500)
          .json({ success: false, message: "Error up voting post" });
      }
    });
    // api  for up down voting a post-----------------------
    app.put("/posts/:id/downvote", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await postCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { downVote: 1 } }
        );
        res.send(result);
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: "Error down voting post" });
      }
    });

    // post api=================================
    // add post ----
    app.post("/add-post", async (req, res) => {
      const post = req.body;
      console.log(post);
      const addPost = await postCollection.insertOne(post);
      res.send(addPost);
    });

    // all post and searched post api --------------
    app.get("/all-post", async (req, res) => {
      try {
        const tag = req.query.tag;
        let query = {};
        if (tag) {
          query = { tag: { $regex: new RegExp(tag, "i") } };
        }
        const allPost = await postCollection
          .find(query)
          .sort({ postedTime: -1 })
          .toArray();
        res.send(allPost);
      } catch (error) {
        console.error(error);
      }
    });
    // all sorted post api -----------------
    app.get("/sorted-posts", async (req, res) => {
      try {
        const sortedPosts = await postCollection
          .aggregate([
            {
              $addFields: {
                voteDifference: { $subtract: ["$upVote", "$downVote"] },
              },
            },
            {
              $sort: { voteDifference: -1 },
            },
          ])
          .toArray();

        res.send(sortedPosts);
      } catch (error) {
        res.status(500).json({ message: "Error fetching sorted posts" });
      }
    });

    // single post api---------------
    app.get("/single-post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const post = await postCollection.findOne(query);
      res.send(post);
    });

    // announcement api -------------
    app.get("/announcements", async (req, res) => {
      const announcement = await announcementCollection.find().toArray();
      res.send(announcement);
    });

    // membership data ---------------------------------
    app.get("/membership", async (req, res) => {
      const membership = await membershipCollection.find().toArray();
      res.send(membership);
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
