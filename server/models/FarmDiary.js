const mongoose = require('mongoose');

const FarmDiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  weather: String,
  activities: String,
  issues: String,
  expenses: String,
  notes: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('FarmDiary', FarmDiarySchema);
