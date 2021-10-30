const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l4fja.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travel');
        const placeCollection = database.collection('places');
        const bookingCollection = database.collection('booking');

        // GET Places API
        app.get('/places', async (req, res) => {
            const cursor = placeCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // GET single place
        app.get('/places/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const place = await placeCollection.findOne(query);
            res.json(place);
        });

        // POST booking api
        app.post('/addbooking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
        });

        // GET MyOrder api
        app.get('/mybookings/:email', async (req, res) => {
            const email = req.params.email;
            const result = await bookingCollection.find({ email: email }).toArray();
            res.send(result)
        });

        // DELETE api
        app.delete('/mybooking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.json(result);

        });

        // GET booking API
        app.get('/managebooking', async (req, res) => {
            const cursor = bookingCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // UPDATE API
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedBooking.status,
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options);
            console.log('updating booking', req.body);
            res.json(result);
        });

        // POST Place Api
        app.post('/addplace', async (req, res) => {
            const place = req.body;
            const result = await placeCollection.insertOne(place);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
