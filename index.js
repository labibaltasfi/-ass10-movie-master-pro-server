const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;



// middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@labibaltasfi.wgwi0xd.mongodb.net/?appName=LabibAlTasfi`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.get('/', (req, res) => {
  res.send('MovieMaster Pro server is running')
})


async function run() {
  try {
    await client.connect();

    const db = client.db('movieMaster_pro_db');
    const moviesCollection = db.collection('movies');
    const allMoviesCollection = db.collection('allMovies');



    app.get('/allMovies', async (req, res) => {
      const cursor = allMoviesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/allMovies/:id", async (req, res) => {
      const id = req.params.id;
      let result = await allMoviesCollection.findOne({ _id: id });

      if (!result) {
        try {
          const objectId = new ObjectId(id);
          result = await allMoviesCollection.findOne({ _id: objectId });
        } catch (err) {
        }
      }

      if (!result) {
        return res.status(404).send({ message: "Movie not found" });
      }

      res.send(result);
    });

    app.delete('/allMovies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await allMoviesCollection.deleteOne(query);
      res.send(result);
    })



    app.post('/allMovies', async (req, res) => {
      const newMovie = req.body;
      const result = await allMoviesCollection.insertOne(newMovie);
      res.send(result);
    })

    app.get('/allMovies', async (req, res) => {
      const cursor = allMoviesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });



    app.patch('/allMovies/:id', async (req, res) => {
      const id = req.params.id;
      const updatedMovie = req.body;

      let query;
      try {
        // Try using ObjectId for MongoDB _id
        query = { _id: new ObjectId(id) };
      } catch (err) {
        // If id is not a valid ObjectId, fallback to string
        query = { _id: id };
      }

      const update = {
        $set: {
          title: updatedMovie.title,
          genre: updatedMovie.genre,
          releaseYear: updatedMovie.releaseYear,
          director: updatedMovie.director,
          cast: updatedMovie.cast,
          rating: updatedMovie.rating,
          duration: updatedMovie.duration,
          plotSummary: updatedMovie.plotSummary,
          posterUrl: updatedMovie.posterUrl,
          language: updatedMovie.language,
          country: updatedMovie.country,
          addedBy: updatedMovie.addedBy,
        },
      };

      try {
        const result = await allMoviesCollection.updateOne(query, update);
        res.send(result);
      } catch (error) {
        console.error("Error updating movie:", error);
        res.status(500).send({ error: "Failed to update movie" });
      }
    });


    app.get('/top-rating-movie', async (req, res) => {
      const result = await allMoviesCollection
        .find()
        .sort({ rating: -1 })
        .limit(5)
        .toArray();

      res.send(result);
    });


    app.get('/myCollection', async (req, res) => {
      const query = {};
      if (query.email) {
        query.addedBy = email;
      }
      const cursor = allMoviesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`MovieMaster Pro  server is running on port: ${port}`)
})