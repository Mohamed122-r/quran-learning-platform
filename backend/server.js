const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/attendance', require('./routes/attendance'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quran-school', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'مرحباً بك في نظام إدارة تعليم القرآن الكريم' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
