const express = require('express');
const app = express();
const cors  = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();


//middleware 
app.use(cors());
app.use(express.json());



app.get('/', (req, res)=>{
    res.send('Running Collegian')
});



const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    
    if(!authorization){
      return res.status(401).send({error: true, message: 'unauthorized'});
    }
  
    //bearer token
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
      
      if(err){
        return res.status(401).send({error: true, message: 'unauthorized'});
      }
      req.decoded = decoded;
      next();
    })
  }



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ir3lm70.mongodb.net/?retryWrites=true&w=majority`;

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



    //Collections
    const collegeCollection = client.db("collegianDB").collection("collegeList");
    const userCollection = client.db("collegianDB").collection("users");


     //JWT
     app.post('/jwt', (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'20d'})
        res.send({token})
      })

      app.get('/colleges', async (req, res) => {
        const colleges = await collegeCollection.find().toArray();
        res.send(colleges);
      })

      app.post('/users', async (req, res) => {
        const user = req.body;
        const query = {email: user.email}
        const existing = await userCollection.findOne(query);
  
        if(existing){
          return res.send({message: "User already exists"})
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      })


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=> {
    console.log(`Collegian port: ${port}`);
})