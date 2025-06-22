const mongoose = require('mongoose');

const MarketPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  location: String,
  availableQuantity: String,
  contactNumber: String,
  image: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Market', MarketPostSchema);
