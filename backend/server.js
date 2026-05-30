const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'selfcare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Database Connection and Tables
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL Connection Pool Created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS moods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mood VARCHAR(50) NOT NULL,
        intensity INT NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
        note TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_date (date)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS journals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tags JSON,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_date (date)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        duration INT,
        completed BOOLEAN DEFAULT FALSE,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_date (date)
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

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
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', message: 'Backend is running', database: 'Connected', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed', error: error.message });
  }
});

// ==================== MOOD ROUTES ====================
// Get all moods
app.get('/api/moods', async (req, res) => {
  try {
    const [moods] = await pool.query('SELECT * FROM moods ORDER BY date DESC');
    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new mood
app.post('/api/moods', async (req, res) => {
  try {
    const { mood, intensity, note } = req.body;
    const [result] = await pool.query(
      'INSERT INTO moods (mood, intensity, note) VALUES (?, ?, ?)',
      [mood, intensity, note || null]
    );
    const [newMood] = await pool.query('SELECT * FROM moods WHERE id = ?', [result.insertId]);
    res.status(201).json(newMood[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get mood statistics
app.get('/api/moods/stats', async (req, res) => {
  try {
    const [moods] = await pool.query('SELECT mood, intensity FROM moods');
    
    if (moods.length === 0) {
      return res.json({ total: 0, averageIntensity: 0, moodDistribution: {} });
    }

    const avgIntensity = moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length;
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
    const [journals] = await pool.query('SELECT * FROM journals ORDER BY date DESC');
    const journalsWithTags = journals.map(j => ({
      ...j,
      tags: j.tags ? JSON.parse(j.tags) : []
    }));
    res.json(journalsWithTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new journal entry
app.post('/api/journals', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const [result] = await pool.query(
      'INSERT INTO journals (title, content, tags) VALUES (?, ?, ?)',
      [title, content, JSON.stringify(tags || [])]
    );
    const [newJournal] = await pool.query('SELECT * FROM journals WHERE id = ?', [result.insertId]);
    const journal = {
      ...newJournal[0],
      tags: newJournal[0].tags ? JSON.parse(newJournal[0].tags) : []
    };
    res.status(201).json(journal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single journal entry
app.get('/api/journals/:id', async (req, res) => {
  try {
    const [journals] = await pool.query('SELECT * FROM journals WHERE id = ?', [req.params.id]);
    if (journals.length === 0) return res.status(404).json({ error: 'Journal not found' });
    const journal = {
      ...journals[0],
      tags: journals[0].tags ? JSON.parse(journals[0].tags) : []
    };
    res.json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete journal entry
app.delete('/api/journals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM journals WHERE id = ?', [req.params.id]);
    res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ACTIVITY ROUTES ====================
// Get all activities
app.get('/api/activities', async (req, res) => {
  try {
    const [activities] = await pool.query('SELECT * FROM activities ORDER BY date DESC');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new activity
app.post('/api/activities', async (req, res) => {
  try {
    const { name, category, duration, completed } = req.body;
    const [result] = await pool.query(
      'INSERT INTO activities (name, category, duration, completed) VALUES (?, ?, ?, ?)',
      [name, category || null, duration || null, completed || false]
    );
    const [newActivity] = await pool.query('SELECT * FROM activities WHERE id = ?', [result.insertId]);
    res.status(201).json(newActivity[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update activity (mark complete)
app.put('/api/activities/:id', async (req, res) => {
  try {
    const { name, category, duration, completed } = req.body;
    await pool.query(
      'UPDATE activities SET name = ?, category = ?, duration = ?, completed = ? WHERE id = ?',
      [name, category, duration, completed, req.params.id]
    );
    const [activity] = await pool.query('SELECT * FROM activities WHERE id = ?', [req.params.id]);
    res.json(activity[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete activity
app.delete('/api/activities/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM activities WHERE id = ?', [req.params.id]);
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
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();