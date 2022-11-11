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

        //services
        //get api multiple
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
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