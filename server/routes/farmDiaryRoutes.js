const express = require('express');
const router = express.Router();
const auth = require('../Middleware/auth');
const FarmDiary = require('../models/FarmDiary');

// CREATE
router.post('/', auth, async (req, res) => {
  try {
    const diary = new FarmDiary({ ...req.body, userId: req.user.id });
    await diary.save();
    res.status(201).json(diary);
  } catch (err) {
    res.status(500).json({ message: 'Error creating diary' });
  }
});

// READ all entries
router.get('/', auth, async (req, res) => {
  try {
    const diaries = await FarmDiary.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(diaries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching diaries' });
  }
});

// UPDATE
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await FarmDiary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Diary not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating diary' });
  }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    await FarmDiary.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Diary deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting diary' });
  }
});

module.exports = router;
