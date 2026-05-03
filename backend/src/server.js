const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import DB to trigger connection test
require('./db');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'DoseBuddy API ✅', version: '2.0.0' });
});

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/students', require('./routes/students'));
app.use('/api/recruiters', require('./routes/recruiters'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/internships', require('./routes/internships'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/exchange', require('./routes/exchange'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/applications', require('./routes/applications'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DoseBuddy API running on http://localhost:${PORT}`);
});
