require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const User = require('./models/User');
const Exercise = require('./models/Exercise');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Exercise Tracker API is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

// POST /api/users
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User({ username: req.body.username });
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id username'); // only return _id and username
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { description, duration, date } = req.body;

    const newExercise = new Exercise({
      userId: user._id,
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    });

    await newExercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: newExercise.date.toDateString(),
      duration: newExercise.duration,
      description: newExercise.description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:_id/logs
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { from, to, limit } = req.query;

    let filter = { userId: user._id };

    // If 'from' or 'to' query params exist, add date range filtering
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const exercises = await Exercise.find(filter)
      .limit(parseInt(limit) || 0)
      .select('description duration date -_id');

    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log: exercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});