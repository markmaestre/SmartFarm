const mongoose = require('mongoose');

const predictionDataSchema = new mongoose.Schema({
    rainfall: Number,
    temperature: Number,
    soil_type: Number,
    crop: Number,
    predicted_days_until_harvest: Number,
});

module.exports = mongoose.model('PredictionData', predictionDataSchema);
