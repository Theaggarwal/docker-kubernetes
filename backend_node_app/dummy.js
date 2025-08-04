const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// POST endpoint to insert user data
app.post('/api/users', async (req, res) => {
  console.log('/users endpoint called');
  console.log(req.body);
  console.log(typeof (req.body));
  res.status(201).json({ message: 'User inserted', id: savedUser._id });
  res.status(500).json({ error: 'Failed to insert user', details: err.message });
});

// POST endpoint to insert user data
app.get('/api/dummy-user', async (req, res) => {
  console.log('/dummy-user endpoint called');
    res.status(201).json({ message: 'User inserted', id: savedUser._id });
});

app.get('/', async (req, res) => {
    console.log("called defualt endpoint.");
    res.send("Default endpoint");
});

app.get('/health-check', async (req, res) => {
  const message = 'I am healthy. thanks for asking.';
  console.log(message);
  res.status(201).send(message)
});

// Middleware to log all request URLs
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
