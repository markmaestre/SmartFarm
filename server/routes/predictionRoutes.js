const express = require('express');
const router = express.Router();
const axios = require('axios');
const PredictionData = require('../models/PredictionData');

router.post('/', async (req, res) => {
    try {
        const { rainfall, temperature, soil_type, crop } = req.body;

 
        const response = await axios.post('http://localhost:5000/predict', {
            rainfall,
            temperature,
            soil_type,
            crop
        });

        const predicted_days_until_harvest = response.data.predicted_days_until_harvest;

        
        const saved = new PredictionData({
            rainfall,
            temperature,
            soil_type,
            crop,
            predicted_days_until_harvest
        });

        await saved.save();
        res.json(saved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Prediction failed" });
    }
});

module.exports = router;
