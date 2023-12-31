const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2kfdekm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toyCollection = client.db('toyCar').collection('services');



        app.get('/toys', async (req, res) => {
            const cursor = toyCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { _id: 1, toyName: 1, sellerName: 1, image: 1, sellerEmail: 1, price: 1, rating: 1, availableQuantity: 1, detailDescription: 1 },
            };
            const result = await toyCollection.findOne(query, options);
            res.send(result);
        })

        app.get('/myToys/:email', async (req, res) => {
            let query = {};
            if (req.params?.email) {
                query = { sellerEmail: req.params.email };
            }

            const result = await toyCollection.find(query).sort({ price: -1 }).toArray();
            res.send(result);
        });





        app.post('/addToy', async (req, res) => {
            const allToys = req.body;
            const result = await toyCollection.insertOne(allToys);
            res.send(result)
        })

        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToys = req.body;
            console.log(updatedToys);
            const toys = {
                $set: {
                    price: updatedToys.price,
                    availableQuantity: updatedToys.availableQuantity,
                    detailDescription: updatedToys.detailDescription
                }
            };
            const result = await toyCollection.updateOne(filter, toys, options);
            res.send(result)
        })


        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('toy server is on')
})

app.listen(port, () => {
    console.log(`toy server side is running on port ${port}`)
})