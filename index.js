const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());

//mongoDb database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bfrcfcb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const run = async () => {
    try {
        const serviceCollection = client.db('snapJudgeDb').collection('services');
        const reviewCollection = client.db('snapJudgeDb').collection('reviews');

        //services
        //get api multiple
        app.get('/services', async (req, res) => {
            const limit = parseInt(req.query.limit);

            const query = {};
            const cursor = serviceCollection.find(query);
            const servicesData = await cursor.limit(limit).toArray();
            res.send(servicesData);
        })
        //single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const data = await serviceCollection.findOne(query);
            res.send(data);
        })

        //addreview
        //post
        app.post('/addreview', async (req, res) => {
            const reviewData = req.body;
            const result = await reviewCollection.insertOne(reviewData);
            res.send(result);
        })

        //get all review by service id
        app.get('/reviews/service/:id', async (req, res) => {
            const id = req.params.id;

            const query = { serviceId: id };

            const cursor = reviewCollection.find(query);
            const servicesData = await cursor.toArray();
            res.send(servicesData);
        })

        //get all review by user id
        app.get('/reviews/user/:id', async (req, res) => {
            const uid = req.params.id;

            const query = { userId: uid };

            const cursor = reviewCollection.find(query);
            const servicesData = await cursor.toArray();
            res.send(servicesData);
        })

    }
    finally {
        //
    }
}
run().catch(error => console.error(error))






app.get('/', (req, res) => {
    res.send('Hello From SnapJudge Server')
})

//run server
app.listen(port, () => {
    console.log('server running', port);
})