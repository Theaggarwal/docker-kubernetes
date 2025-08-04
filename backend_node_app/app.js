const express = require("express");
const mongoose = require("mongoose");
const User = require('./models/User');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;


//MongoDB Connection Function
const connectToMongoDB = async () => {
  try {

    //mongodb://mongo-0.mongo-headless.default.svc.cluster.local/?authSource=admin
    const uri = process.env.MONGO_URI;

    await mongoose.connect(uri, {
      user: process.env.MONGO_USER, // 'adminuser',
      pass: process.env.MONGO_PASSWORD, // 'password123',
      authSource: process.env.MONGO_AUTH_SOURCE, // ?? 'admin',
      dbName: process.env.MONGO_DB, // ?? 'mydb',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10 // connection pooling via the maxPoolSize option.
    });

    console.log('MongoDB connected');
    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    return false;
  }
};

connectToMongoDB();

// POST endpoint to insert user data
app.post('/users', async (req, res) => {
  console.log('users endpoint called');
  try {
    console.log(req.body);
    console.log(typeof(req.body));
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json({ message: 'User inserted', id: savedUser._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert user', details: err.message });
  }
});

// POST endpoint to insert user data
app.get('/dummy-user', async (req, res) => {
  console.log('dummy-user endpoint called');
  try {
   
    const user = new User({
      email:'test@test.com',
      name:'test user',
      age : 10
    });
    console.log(user);
    const savedUser = await user.save();
    res.status(201).json({ message: 'User inserted', id: savedUser._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to insert user', details: err.message });
  }
});

app.get('/', async (req, res) => {
  try {
    console.log("called default endpoint.");
    const users = await User.find({});
    console.log(users);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.send("Error fetching users");
  }
});


app.get('/health', async (req, res) => {
  const message = 'I am healthy. Thanks for asking.';
  console.log(message);
  res.status(201).send(message)
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
