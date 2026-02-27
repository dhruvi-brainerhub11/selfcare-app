const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb-service:27017/selfcare';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Models
const MoodSchema = new mongoose.Schema({
  mood: { type: String, required: true },
  intensity: { type: Number, required: true, min: 1, max: 10 },
  note: String,
  date: { type: Date, default: Date.now }
});

const JournalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  date: { type: Date, default: Date.now }
});

const ActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  duration: Number,
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

const Mood = mongoose.model('Mood', MoodSchema);
const Journal = mongoose.model('Journal', JournalSchema);
const Activity = mongoose.model('Activity', ActivitySchema);

// Inspirational Quotes Database
const quotes = [
  { text: "Taking care of yourself is the most powerful way to begin to take care of others.", author: "Bryant McGill" },
  { text: "Self-care is not selfish. You cannot serve from an empty vessel.", author: "Eleanor Brown" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha" },
  { text: "Nourishing yourself in a way that helps you blossom is attainable, and you are worth the effort.", author: "Deborah Day" },
  { text: "Rest and self-care are so important. When you take time to replenish your spirit, it allows you to serve others from the overflow.", author: "Eleanor Brown" },
  { text: "An empty lantern provides no light. Self-care is the fuel that allows your light to shine brightly.", author: "Unknown" },
  { text: "Talk to yourself like you would to someone you love.", author: "Brené Brown" }
];

// ==================== ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running', timestamp: new Date() });
});

// ==================== MOOD ROUTES ====================
// Get all moods
app.get('/api/moods', async (req, res) => {
  try {
    const moods = await Mood.find().sort({ date: -1 });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new mood
app.post('/api/moods', async (req, res) => {
  try {
    const mood = new Mood(req.body);
    await mood.save();
    res.status(201).json(mood);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get mood statistics
app.get('/api/moods/stats', async (req, res) => {
  try {
    const moods = await Mood.find();
    const avgIntensity = moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length || 0;
    const moodCounts = moods.reduce((acc, m) => {
      acc[m.mood] = (acc[m.mood] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      total: moods.length,
      averageIntensity: avgIntensity.toFixed(2),
      moodDistribution: moodCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== JOURNAL ROUTES ====================
// Get all journal entries
app.get('/api/journals', async (req, res) => {
  try {
    const journals = await Journal.find().sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new journal entry
app.post('/api/journals', async (req, res) => {
  try {
    const journal = new Journal(req.body);
    await journal.save();
    res.status(201).json(journal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single journal entry
app.get('/api/journals/:id', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ error: 'Journal not found' });
    res.json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete journal entry
app.delete('/api/journals/:id', async (req, res) => {
  try {
    await Journal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ACTIVITY ROUTES ====================
// Get all activities
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new activity
app.post('/api/activities', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update activity (mark complete)
app.put('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete activity
app.delete('/api/activities/:id', async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== QUOTES ROUTES ====================
// Get random quote
app.get('/api/quotes/random', (req, res) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json(randomQuote);
});

// Get all quotes
app.get('/api/quotes', (req, res) => {
  res.json(quotes);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});