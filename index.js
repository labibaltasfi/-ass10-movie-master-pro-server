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
    const usersCollection = db.collection('users');
    const watchlistCollection = db.collection('watchlist');

    // USERS APIs
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        res.send({ message: 'user already exits. do not need to insert again' })
      }
      else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    })

    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });



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
        query = { _id: new ObjectId(id) };
      } catch (err) {
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

    app.get("/allMovies", async (req, res) => {
      const { genres, minRating, maxRating } = req.query;

      let query = {};


      if (genres && genres.length > 0) {
        query.genre = { $in: genres };
      }


      if (minRating || maxRating) {
        query.rating = {};
        if (minRating) query.rating.$gte = Number(minRating);
        if (maxRating) query.rating.$lte = Number(maxRating);
      }

      const movies = await moviesCollection.find(query).toArray();
      res.send(movies);
    });



    app.get('/top-rating-movie', async (req, res) => {
      const result = await allMoviesCollection
        .find()
        .sort({ rating: -1 })
        .limit(5)
        .toArray();
      res.send(result);
    });

    app.get("/recent-movies", async (req, res) => {
      const movies = await allMoviesCollection
        .find({})
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.send(movies);
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



    app.post("/watchlist", async (req, res) => {
      try {
        const { email, movie } = req.body;
        const existing = await watchlistCollection.findOne({
          email: email,
          "movie._id": movie._id
        });

        if (existing) {
          return res.status(400).send({ message: "Movie already add watchlist" });
        }


        const result = await watchlistCollection.insertOne({
          email,
          movie,
          createdAt: new Date()
        });

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to add movie" });
      }
    });


   app.get("/watchlist/user/:email", async (req, res) => {
    const email = req.params.email;
    const result = await watchlistCollection.find({ email }).toArray();
    res.send(result);
});


     app.get("/watchlist/:id", async (req, res) => {
    const id = req.params.id;
    const result = await watchlistCollection.findOne({
        _id: new ObjectId(id)
    });
    res.send(result);
});


    app.delete('/watchlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await watchlistCollection.deleteOne(query);
      res.send(result);
    })





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