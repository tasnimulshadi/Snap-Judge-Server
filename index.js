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
        const database = client.db('snapJudgeDb');
        const serviceCollection = database.collection('services');
        const reviewCollection = database.collection('reviews');
        const blogCollection = database.collection('blogs');

        //services
        //post service
        app.post('/service', async (req, res) => {
            const reviewData = req.body;
            const result = await serviceCollection.insertOne(reviewData);
            res.send(result);
        })

        //get api multiple services with limit
        app.get('/services', async (req, res) => {
            const index = parseInt(req.query.index);
            const limit = parseInt(req.query.limit);

            //count
            const count = await serviceCollection.countDocuments();

            //data
            const query = {};
            const cursor = serviceCollection.find(query);
            const servicesData = await cursor.skip(index * limit).limit(limit).toArray();
            res.send({ services: servicesData, count });
        })
        //single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const data = await serviceCollection.findOne(query);
            res.send(data);
        })

        //update service rating by service id
        app.patch('/service/update/rating/:id', async (req, res) => {
            const service_id = req.params.id;

            const serviceQuery = { serviceId: service_id };
            const serviceOptions = {
                // Include only the `rating` fields in each returned document
                projection: { _id: 0, rating: 1 },
            };

            // get all the reviews ratings
            const cursor = reviewCollection.find(serviceQuery, serviceOptions);
            const reviewsData = await cursor.toArray();

            //average calculaton
            const sum = reviewsData.reduce((previousValue, currentValue) => previousValue + currentValue.rating, 0);
            const avg = Math.round(sum / reviewsData.length);

            //update rating of service
            const updateRatingFilter = { _id: ObjectId(service_id) };
            const updateRatingDoc = {
                $set: {
                    rating: avg
                },
            };
            const result = await serviceCollection.updateOne(updateRatingFilter, updateRatingDoc);

            res.send(result);
        })


        //addreview
        //post review
        app.post('/addreview', async (req, res) => {
            const reviewData = req.body;
            const result = await reviewCollection.insertOne(reviewData);
            res.send(result);
        })

        //get all review by service id
        app.get('/reviews/service/:id', async (req, res) => {
            const id = req.params.id;

            const query = { serviceId: id };

            // find().sort({ _id: -1 });  ***(1 for asc and -1 for desc)***
            const cursor = reviewCollection.find(query).sort({ _id: -1 });

            const data = await cursor.toArray();
            res.send(data);
        })

        //get all review by user id
        app.get('/reviews/user/:id', async (req, res) => {
            const uid = req.params.id;

            const query = { userId: uid };

            const cursor = reviewCollection.find(query);
            const data = await cursor.toArray();
            res.send(data);
        })

        //get single review by review id
        app.get('/review/:id', async (req, res) => {
            const reviewId = req.params.id;
            const query = { _id: ObjectId(reviewId) };
            const data = await reviewCollection.findOne(query);
            res.send(data);
        })

        //delete review api
        app.delete('/reviews/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        //update review api
        app.patch('/review/update', async (req, res) => {
            const { id, message, rating } = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    message,
                    rating
                }
            };
            const result = await reviewCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        //blogs
        //get all blogs api
        app.get('/blogs', async (req, res) => {
            const query = {};
            const cursor = blogCollection.find(query);
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

app.get('/button', (req, res) => {
    // const date = ObjectId.getTimestamp()
    console.log(date);

    res.send({ msg: 'button from server' })
})

//run server
app.listen(port, () => {
    console.log('server running', port);
})