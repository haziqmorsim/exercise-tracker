require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./sequelize');
const User = require('./models/user');
const Exercise = require('./models/exercise');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sync database
sequelize.sync().then(() => console.log('✅ Database synced'));

// Routes

app.get('/', (req, res) => {
  res.send('Exercise Tracker API running with SQLite.');
});

// POST /api/users
app.post('/api/users', async (req, res) => {
  const user = await User.create({ username: req.body.username });
  res.json({ username: user.username, _id: user.id });
});

// GET /api/users
app.get('/api/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  const user = await User.findByPk(req.params._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const date = req.body.date ? new Date(req.body.date) : new Date();

  const exercise = await Exercise.create({
    description: req.body.description,
    duration: req.body.duration,
    date: date,
    UserId: user.id
  });

  res.json({
    _id: user.id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  });
});

// GET /api/users/:_id/logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const user = await User.findByPk(req.params._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const exercises = await Exercise.findAll({
    where: { UserId: user.id }
  });

  res.json({
    _id: user.id,
    username: user.username,
    count: exercises.length,
    log: exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});