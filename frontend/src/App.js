import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaSmile, FaMeh, FaFrown, FaBook, FaHeart, 
  FaQuoteLeft, FaSun, FaMoon, FaLeaf 
} from 'react-icons/fa';

// Configure API URL
const API_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [moods, setMoods] = useState([]);
  const [journals, setJournals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});

  // Fetch data on mount
  useEffect(() => {
    fetchQuote();
    fetchMoods();
    fetchJournals();
    fetchActivities();
    fetchStats();
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await axios.get(`${API_URL}/quotes/random`);
      setQuote(response.data);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const fetchMoods = async () => {
    try {
      const response = await axios.get(`${API_URL}/moods`);
      setMoods(response.data);
    } catch (error) {
      console.error('Error fetching moods:', error);
    }
  };

  const fetchJournals = async () => {
    try {
      const response = await axios.get(`${API_URL}/journals`);
      setJournals(response.data);
    } catch (error) {
      console.error('Error fetching journals:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/moods/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ==================== MOOD TRACKER ====================
  const MoodTracker = () => {
    const [selectedMood, setSelectedMood] = useState('');
    const [intensity, setIntensity] = useState(5);
    const [note, setNote] = useState('');

    const moodOptions = [
      { name: 'Happy', icon: <FaSmile className="text-4xl" />, color: 'text-yellow-500' },
      { name: 'Calm', icon: <FaLeaf className="text-4xl" />, color: 'text-green-500' },
      { name: 'Neutral', icon: <FaMeh className="text-4xl" />, color: 'text-gray-500' },
      { name: 'Sad', icon: <FaFrown className="text-4xl" />, color: 'text-blue-500' },
      { name: 'Anxious', icon: <FaMoon className="text-4xl" />, color: 'text-purple-500' },
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API_URL}/moods`, {
          mood: selectedMood,
          intensity,
          note
        });
        setSelectedMood('');
        setIntensity(5);
        setNote('');
        fetchMoods();
        fetchStats();
        alert('Mood logged successfully! 🎉');
      } catch (error) {
        alert('Error logging mood');
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaHeart className="text-red-500" /> Mood Tracker
        </h2>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-4 text-gray-700">
                How are you feeling today?
              </label>
              <div className="grid grid-cols-5 gap-4">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.name}
                    type="button"
                    onClick={() => setSelectedMood(mood.name)}
                    className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      selectedMood === mood.name
                        ? 'border-primary bg-primary/10 scale-105'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className={`flex flex-col items-center gap-2 ${mood.color}`}>
                      {mood.icon}
                      <span className="font-medium text-gray-700">{mood.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Intensity: {intensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Add a note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                rows="3"
                placeholder="What's on your mind?"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedMood}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log Mood
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Recent Moods</h3>
          <div className="space-y-3">
            {moods.slice(0, 5).map((mood) => (
              <div key={mood._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-semibold text-lg">{mood.mood}</span>
                  <span className="text-gray-500 ml-2">• Intensity: {mood.intensity}/10</span>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(mood.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ==================== JOURNAL ====================
  const Journal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API_URL}/journals`, {
          title,
          content,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        });
        setTitle('');
        setContent('');
        setTags('');
        fetchJournals();
        alert('Journal entry saved! 📝');
      } catch (error) {
        alert('Error saving journal entry');
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaBook className="text-blue-500" /> Daily Journal
        </h2>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                placeholder="Give your entry a title..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Your Thoughts
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                rows="8"
                placeholder="Write your thoughts, feelings, and reflections..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                placeholder="gratitude, reflection, goals..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all"
            >
              Save Entry
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Recent Entries</h3>
          <div className="space-y-4">
            {journals.slice(0, 3).map((journal) => (
              <div key={journal._id} className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-primary">
                <h4 className="font-bold text-xl text-gray-800 mb-2">{journal.title}</h4>
                <p className="text-gray-600 mb-3 line-clamp-2">{journal.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {journal.tags?.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-primary font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(journal.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ==================== ACTIVITIES ====================
  const Activities = () => {
    const [activityName, setActivityName] = useState('');
    const [category, setCategory] = useState('');
    const [duration, setDuration] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API_URL}/activities`, {
          name: activityName,
          category,
          duration: Number(duration)
        });
        setActivityName('');
        setCategory('');
        setDuration('');
        fetchActivities();
        alert('Activity added! 🎯');
      } catch (error) {
        alert('Error adding activity');
      }
    };

    const toggleComplete = async (id, completed) => {
      try {
        await axios.put(`${API_URL}/activities/${id}`, { completed: !completed });
        fetchActivities();
      } catch (error) {
        alert('Error updating activity');
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaSun className="text-yellow-500" /> Self-Care Activities
        </h2>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Activity Name
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="Meditation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Physical">Physical</option>
                  <option value="Mental">Mental</option>
                  <option value="Social">Social</option>
                  <option value="Spiritual">Spiritual</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="30"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all"
            >
              Add Activity
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Your Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  activity.completed
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200 hover:border-primary'
                }`}
                onClick={() => toggleComplete(activity._id, activity.completed)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${activity.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {activity.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.category} • {activity.duration} min
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    activity.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {activity.completed && <span className="text-white text-sm">✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ==================== DASHBOARD ====================
  const Dashboard = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to Your Self-Care Journey 🌟</h2>
        
        {/* Quote of the Day */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-start gap-4">
            <FaQuoteLeft className="text-4xl opacity-50 mt-2" />
            <div>
              <p className="text-2xl font-light italic mb-4">"{quote.text}"</p>
              <p className="text-lg font-semibold">— {quote.author}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Mood Entries</p>
                <p className="text-4xl font-bold text-primary mt-2">{stats.total || 0}</p>
              </div>
              <FaHeart className="text-5xl text-red-300" />
            </div>
            {stats.averageIntensity && (
              <p className="text-sm text-gray-500 mt-3">
                Avg Intensity: {stats.averageIntensity}/10
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Journal Entries</p>
                <p className="text-4xl font-bold text-blue-500 mt-2">{journals.length}</p>
              </div>
              <FaBook className="text-5xl text-blue-300" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold">Activities</p>
                <p className="text-4xl font-bold text-green-500 mt-2">{activities.length}</p>
              </div>
              <FaSun className="text-5xl text-yellow-300" />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Completed: {activities.filter(a => a.completed).length}
            </p>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Moods</h3>
            <div className="space-y-2">
              {moods.slice(0, 3).map((mood) => (
                <div key={mood._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold">{mood.mood}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{mood.intensity}/10</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Today's Activities</h3>
            <div className="space-y-2">
              {activities.slice(0, 3).map((activity) => (
                <div key={activity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className={activity.completed ? 'line-through text-gray-400' : 'font-medium'}>
                    {activity.name}
                  </span>
                  <span className="text-sm text-gray-500">{activity.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Self-Care Wellness 🌸
          </h1>
          <p className="text-gray-600 mt-2">Your personal space for mental and emotional well-being</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'mood', label: 'Mood Tracker', icon: '💭' },
              { id: 'journal', label: 'Journal', icon: '📝' },
              { id: 'activities', label: 'Activities', icon: '🎯' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'mood' && <MoodTracker />}
        {activeTab === 'journal' && <Journal />}
        {activeTab === 'activities' && <Activities />}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6 border-t">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>Made with 💜 for your well-being • Take care of yourself</p>
        </div>
      </footer>
    </div>
  );
}

export default App;