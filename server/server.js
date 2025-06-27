require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const farmDiaryRoutes = require('./routes/farmDiaryRoutes');
const marketRoutes = require('./routes/marketRoutes')
const predictionRoutes = require('./routes/predictionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes)
app.use('/api/farmdiary', farmDiaryRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/predict', predictionRoutes);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection failed:", err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
